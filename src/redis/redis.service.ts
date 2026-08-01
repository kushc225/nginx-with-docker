import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private readonly configService: ConfigService) {
    const host =
      this.configService.get<string>('redis.host') ??
      this.configService.get<string>('REDIS_HOST') ??
      '127.0.0.1';
    const port =
      this.configService.get<number>('redis.port') ??
      Number(this.configService.get<string>('REDIS_PORT')) ??
      6379;

    this.client = createClient({
      socket: {
        host,
        port,
      },
    });

    this.logger.debug(`Redis host resolved as ${host}:${port}`);

    this.client.on('error', (error) => {
      this.logger.error('Redis client error', error);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.disconnect();
  }

  getClient(): RedisClientType {
    return this.client;
  }

  async getValue(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async setValue(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async deleteKey(key: string): Promise<number> {
    return this.client.del(key);
  }

  async scanKeys(pattern: string): Promise<string[]> {
    const keys: string[] = [];
    for await (const key of this.client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      keys.push(key);
    }
    return keys;
  }
}
