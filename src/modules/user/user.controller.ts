import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateProfileDto } from './dto/create-profile.dto';
import { SwaggerConsumes } from '../../common/enums/swagger-consumes.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerStorage } from '../../common/utils/multer.util';
import { SwaggerAuthName } from '../../common/enums/swagger-auth-name.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { ProfileImages } from './types/files';
import { UploadedOptionalFiles } from '../../common/decorators/upload-file.decorator';

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
}
