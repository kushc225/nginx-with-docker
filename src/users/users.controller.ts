import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiOkResponse({ type: UserEntity })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID with cache aside pattern' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse({ description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing user and refresh cache' })
  @ApiOkResponse({ type: UserEntity })
  @ApiNotFoundResponse({ description: 'User not found' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete('cache/:id')
  @ApiOperation({ summary: 'Delete cached user only' })
  @ApiOkResponse({ description: 'Cache key deleted' })
  async deleteCache(@Param('id') id: string) {
    return await this.usersService.deleteCache(id);
  }

  @Delete('cache')
  @ApiOperation({ summary: 'Clear all cached users' })
  @ApiOkResponse({ description: 'Matching cache keys deleted' })
  async clearCache() {
    return await this.usersService.clearCache();
  }
}
