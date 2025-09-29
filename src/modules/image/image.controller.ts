import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageDto } from './dto/image.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthDecorator } from '../../common/decorators/auth.decorator';
import { UploadFileInterceptor } from '../../common/interceptors/upload.interceptor';
import { MulterFileType } from '../../common/utils/multer.util';
import { SwaggerConsumes } from '../../common/enums/swagger-consumes.enum';

@Controller('image')
@ApiTags('image')
@AuthDecorator()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @UseInterceptors(UploadFileInterceptor('image'))
  @ApiConsumes(SwaggerConsumes.Multipart)
  create(@Body() imageDto: ImageDto, @UploadedFile() image: MulterFileType) {
    return this.imageService.create(imageDto, image);
  }

  @Get()
  findAll() {
    return this.imageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imageService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imageService.remove(+id);
  }
}
