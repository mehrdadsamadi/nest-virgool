import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/blog.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from '../../common/enums/swagger-consumes.enum';
import { SwaggerAuthName } from '../../common/enums/swagger-auth-name.enum';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('blog')
@ApiTags('Blog')
@ApiBearerAuth(SwaggerAuthName.Authorization)
@UseGuards(AuthGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('/')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() blogDto: CreateBlogDto) {
    return this.blogService.create(blogDto);
  }

  @Get('/my')
  myBlogs() {
    return this.blogService.myBlogs();
  }
}
