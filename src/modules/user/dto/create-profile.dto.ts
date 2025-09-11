import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsOptional,
  Length,
} from 'class-validator';
import { Gender } from '../enum/gender.enum';
import { ValidationMessage } from '../../../common/enums/message.enum';

export class CreateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Length(3, 10)
  nickName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Length(10, 200)
  bio: string;

  @ApiPropertyOptional({ format: 'binary' })
  imageProfile: string;

  @ApiPropertyOptional({ format: 'binary' })
  bgImage: string;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender: string;

  @ApiPropertyOptional({ example: '2025-09-06T06:47:27.443Z' })
  birthDate: Date;

  @ApiPropertyOptional()
  linkedinProfile: string;

  @ApiPropertyOptional()
  xProfile: string;
}

export class ChangeEmailDto {
  @ApiProperty()
  @IsEmail({}, { message: ValidationMessage.InvalidEmailFormat })
  email: string;
}

export class ChangePhoneDto {
  @ApiProperty()
  @IsMobilePhone('fa-IR', {}, { message: ValidationMessage.InvalidPhoneFormat })
  phone: string;
}
