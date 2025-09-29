import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from '../../../common/enums/swagger-consumes.enum';
import { BlogCommentService } from '../services/comment.service';
import { CreateBlogCommentDto } from '../dto/comment.dto';
import { Pagination } from '../../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { AuthDecorator } from '../../../common/decorators/auth.decorator';

@Controller('blog-comment')
@ApiTags('Blog')
@AuthDecorator()
export class BlogCommentController {
  constructor(private readonly blogCommentService: BlogCommentService) {}

  @Post('/')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  create(@Body() blogCommentDto: CreateBlogCommentDto) {
    return this.blogCommentService.create(blogCommentDto);
  }

  @Get('/')
  @Pagination()
  blogCommentsList(@Query() paginationDto: PaginationDto) {
    return this.blogCommentService.blogCommentsList(paginationDto);
  }

  @Patch('/accept/:id')
  accept(@Param('id', ParseIntPipe) id: number) {
    return this.blogCommentService.accept(id);
  }

  @Patch('/reject/:id')
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.blogCommentService.reject(id);
  }
}
