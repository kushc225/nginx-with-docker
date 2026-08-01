import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: '8b93d2d0-...' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 25 })
  age: number;

  @ApiProperty({ example: '2026-07-31T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-31T12:00:00.000Z' })
  updatedAt: Date;
}
