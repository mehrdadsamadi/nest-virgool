import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, Length } from 'class-validator';

export class CreateBlogCommentDto {
  @ApiProperty()
  @Length(5)
  text: string;

  @ApiProperty()
  @IsNumberString()
  blogId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  parentId: number;
}
