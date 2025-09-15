import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { CreateBlogDto } from './dto/blog.dto';
import { generateSlug, randomId } from '../../common/utils/functions.util';
import { BlogStatus } from './enum/status.enum';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PublicMessage } from '../../common/enums/message.enum';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(blogDto: CreateBlogDto) {
    let { title, slug, content, description, image, studyTime } = blogDto;

    const { id: userId } = this.request.user!;

    const tempSlug = slug ?? title;
    slug = generateSlug(tempSlug);

    const existSlug = await this.checkBlogBySlug(slug);
    if (existSlug) {
      slug = `${slug}-${randomId()}`;
    }

    const blog = this.blogRepository.create({
      title,
      slug,
      content,
      description,
      image,
      studyTime,
      status: BlogStatus.DRAFT,
      authorId: userId,
    });

    await this.blogRepository.save(blog);

    return {
      message: PublicMessage.Created,
    };
  }

  async myBlogs() {
    const { id: userId } = this.request.user!;

    return this.blogRepository.find({
      where: { authorId: userId },
      order: {
        id: 'DESC',
      },
    });
  }

  async checkBlogBySlug(slug: string) {
    const blog = await this.blogRepository.findOneBy({ slug });

    return !!blog;
  }
}
