import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateBlogDto, FilterBlogDto } from './dto/blog.dto';
import { generateSlug, randomId } from '../../common/utils/functions.util';
import { BlogStatus } from './enum/status.enum';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { PublicMessage } from '../../common/enums/message.enum';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import {
  paginationGenerator,
  paginationSolver,
} from '../../common/utils/pagination.util';
import { CategoryService } from '../category/category.service';
import { BlogCategoryEntity } from './entities/blog-category.entity';

@Injectable({ scope: Scope.REQUEST })
export class BlogService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCategoryEntity)
    private blogCategoryRepository: Repository<BlogCategoryEntity>,
    @Inject(REQUEST) private request: Request,
    private categoryService: CategoryService,
  ) {}

  async create(blogDto: CreateBlogDto) {
    const { id: userId } = this.request.user!;

    let { title, slug, content, description, image, studyTime, categories } =
      blogDto;

    if (!categories) {
      categories = [];
    } else if (!Array.isArray(categories)) {
      categories = categories.split(',');
    }

    const tempSlug = slug ?? title;
    slug = generateSlug(tempSlug);

    const existSlug = await this.checkBlogBySlug(slug);
    if (existSlug) {
      slug = `${slug}-${randomId()}`;
    }

    let blog = this.blogRepository.create({
      title,
      slug,
      content,
      description,
      image,
      studyTime,
      status: BlogStatus.DRAFT,
      authorId: userId,
    });

    blog = await this.blogRepository.save(blog);

    for (const categoryTitle of categories) {
      let category = await this.categoryService.findOneByTitle(categoryTitle);
      if (!category) {
        category = await this.categoryService.insertByTitle(categoryTitle);
      }

      await this.blogCategoryRepository.insert({
        blogId: blog.id,
        categoryId: category.id,
      });
    }

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

  async blogsList(paginationDto: PaginationDto, filterDto: FilterBlogDto) {
    const { limit, skip, page } = paginationSolver(paginationDto);

    const { category } = filterDto;

    const where: FindOptionsWhere<BlogEntity> = {};

    if (category) {
      where['categories'] = {
        category: {
          title: category,
        },
      };
    }

    const [blogs, count] = await this.blogRepository.findAndCount({
      relations: {
        categories: {
          category: true,
        },
      },
      where,
      select: {
        categories: {
          id: true,
          category: {
            id: true,
            title: true,
          },
        },
      },
      order: {
        id: 'DESC',
      },
      skip,
      take: limit,
    });

    return {
      pagination: paginationGenerator(count, page, limit),
      blogs,
    };
  }

  async checkBlogBySlug(slug: string) {
    const blog = await this.blogRepository.findOneBy({ slug });

    return !!blog;
  }
}
