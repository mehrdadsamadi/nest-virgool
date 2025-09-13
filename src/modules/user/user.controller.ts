import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  ChangeEmailDto,
  ChangePhoneDto,
  ChangeUsernameDto,
  CreateProfileDto,
} from './dto/create-profile.dto';
import { SwaggerConsumes } from '../../common/enums/swagger-consumes.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerStorage } from '../../common/utils/multer.util';
import { SwaggerAuthName } from '../../common/enums/swagger-auth-name.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ProfileImages } from './types/files';
import { UploadedOptionalFiles } from '../../common/decorators/upload-file.decorator';
import { Response } from 'express';
import { CookieKeys } from '../../common/enums/cookie.enum';
import { OtpCookieOptions } from '../../common/utils/cookie.util';
import { PublicMessage } from '../../common/enums/message.enum';
import { CheckOtpDto } from '../auth/dto/auth.dto';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth(SwaggerAuthName.Authorization)
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Put('/profile')
  @ApiConsumes(SwaggerConsumes.Multipart)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'bgImage', maxCount: 1 },
        { name: 'imageProfile', maxCount: 1 },
      ],
      {
        storage: multerStorage('user-profile'),
      },
    ),
  )
  changeProfile(
    @UploadedOptionalFiles() files: ProfileImages,
    @Body() profileDto: CreateProfileDto,
  ) {
    return this.userService.changeProfile(files, profileDto);
  }

  @Get('/profile')
  profile() {
    return this.userService.profile();
  }

  @Patch('/change-email')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeEmail(@Body() emailDto: ChangeEmailDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changeEmail(
      emailDto.email,
    );

    if (message) {
      return res.json({ message });
    }

    res.cookie(CookieKeys.EmailOtp, token, OtpCookieOptions());

    res.json({
      message: PublicMessage.SentOpt,
      code,
    });
  }

  @Post('/verify-email-otp')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyEmail(@Body() otpDto: CheckOtpDto) {
    return this.userService.verifyEmail(otpDto.code);
  }

  @Patch('/change-phone')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changePhone(@Body() phoneDto: ChangePhoneDto, @Res() res: Response) {
    const { code, token, message } = await this.userService.changePhone(
      phoneDto.phone,
    );

    if (message) {
      return res.json({ message });
    }

    res.cookie(CookieKeys.PhoneOtp, token, OtpCookieOptions());

    res.json({
      message: PublicMessage.SentOpt,
      code,
    });
  }

  @Post('/verify-phone-otp')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async verifyPhone(@Body() otpDto: CheckOtpDto) {
    return this.userService.verifyPhone(otpDto.code);
  }

  @Patch('/change-username')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  async changeUsername(@Body() usernameDto: ChangeUsernameDto) {
    return this.userService.changeUsername(usernameDto.username);
  }
}
