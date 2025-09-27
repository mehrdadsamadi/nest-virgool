import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from '../../../common/enums/swagger-consumes.enum';
import { SwaggerAuthName } from '../../../common/enums/swagger-auth-name.enum';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { BlogCommentService } from '../services/comment.service';
import { CreateBlogCommentDto } from '../dto/comment.dto';
import { Pagination } from '../../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../../common/dtos/pagination.dto';

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
