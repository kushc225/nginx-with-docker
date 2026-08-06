import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly cachePrefix = 'user:';
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  private buildCacheKey(id: string): string {
    return `${this.cachePrefix}${id}`;
  }

  private async cacheUser(user: unknown): Promise<void> {
    if (!user || typeof user !== 'object') return;
    const id = (user as { id?: string }).id;
    if (!id) return;
    await this.redisService.setValue(this.buildCacheKey(id), JSON.stringify(user));
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: createUserDto,
      });

      try {
        await this.cacheUser(user);
      } catch (cacheError) {
        this.logger.error('Failed to cache user after create', {
          error: cacheError,
          userId: (user as { id?: string }).id,
        });
      }

      return user;
    } catch (error: unknown) {
      this.logger.error('Unable to create user', {
        error,
        payload: createUserDto,
      });

      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002' &&
        Array.isArray(error.meta?.target) &&
        error.meta.target.includes('email')
      ) {
        throw new InternalServerErrorException('Email already exists');
      }
      throw new InternalServerErrorException('Unable to create user');
    }
  }

  async findOne(id: string) {
    const cacheKey = this.buildCacheKey(id);
    try {
      const cached = await this.redisService.getValue(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // Redis unavailable, fallback to DB
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    await this.cacheUser(user);
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    try {
      await this.cacheUser(updated);
    } catch {
      // If Redis fails, still return updated DB result
    }

    return updated;
  }

  async deleteCache(id: string) {
    const deletedCount = await this.redisService.deleteKey(
      this.buildCacheKey(id),
    );
    return { deleted: deletedCount };
  }

  async clearCache() {
    const keys = await this.redisService.scanKeys(`${this.cachePrefix}*`);
    if (keys.length === 0) {
      return { deleted: 0 };
    }

    const deletedCount = await Promise.all(
      keys.map((key) => this.redisService.deleteKey(key)),
    );

    return { deleted: deletedCount.reduce((sum, value) => sum + value, 0) };
  }
}
