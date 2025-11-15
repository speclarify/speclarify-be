import { ApiProperty } from '@nestjs/swagger';

export class ProjectResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  description: string;

  @ApiProperty()
  photo?: string;
}
