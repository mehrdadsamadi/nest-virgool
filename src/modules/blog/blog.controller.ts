import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumes } from '../../common/enums/swagger-consumes.enum';
import { SwaggerAuthName } from '../../common/enums/swagger-auth-name.enum';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Pagination } from '../../common/decorators/pagination.decorator';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { SkipAuth } from '../../common/decorators/skip-auth.decorator';
import { FilterBlog } from '../../common/decorators/filter.decorator';

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

  @Get('/')
  @SkipAuth()
  @Pagination()
  @FilterBlog()
  blogsList(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterBlogDto,
  ) {
    return this.blogService.blogsList(paginationDto, filterDto);
  }

  @Get('/like/:id')
  likeToggle(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.likeToggle(id);
  }

  @Delete('/:id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.delete(id);
  }

  @Put('/:id')
  @ApiConsumes(SwaggerConsumes.UrlEncoded, SwaggerConsumes.Json)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() blogDto: UpdateBlogDto,
  ) {
    return this.blogService.update(id, blogDto);
  }
}
