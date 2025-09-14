import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { CreateBlogDto } from './dto/blog.dto';
import { generateSlug } from '../../common/utils/functions.util';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
  ) {}

  async create(blogDto: CreateBlogDto) {
    const { title, slug } = blogDto;

    const tempSlug = slug ?? title;
    blogDto.slug = generateSlug(tempSlug);

    return blogDto;
  }
}
