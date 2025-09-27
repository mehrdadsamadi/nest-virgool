import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from '../../../common/enums/swagger-consumes.enum';
import { SwaggerAuthName } from '../../../common/enums/swagger-auth-name.enum';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { BlogCommentService } from '../services/comment.service';
import { CreateBlogCommentDto } from '../dto/comment.dto';

@Controller('blog-comment')
@ApiTags('Blog')
@ApiBearerAuth(SwaggerAuthName.Authorization)
@UseGuards(AuthGuard)
export class BlogCommentController {
  constructor(private readonly blogCommentService: BlogCommentService) {}

  @Post('/')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() blogCommentDto: CreateBlogCommentDto) {
    return this.blogCommentService.create(blogCommentDto);
  }
}
