import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, Length } from 'class-validator';
import { Gender } from '../enum/gender.enum';

export class CreateProfileDto {
  @ApiPropertyOptional()
  @Length(10, 100)
  nickName: string;

  @ApiPropertyOptional()
  @Length(10, 200)
  bio: string;

  @ApiPropertyOptional({ format: 'binary' })
  imageProfile: string;

  @ApiPropertyOptional({ format: 'binary' })
  bgImage: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsEnum(Gender)
  gender: string;

  @ApiPropertyOptional({ example: '2025-09-06T06:47:27.443Z' })
  birthDate: Date;

  @ApiPropertyOptional()
  linkedinProfile: string;

  @ApiPropertyOptional()
  xProfile: string;
}
