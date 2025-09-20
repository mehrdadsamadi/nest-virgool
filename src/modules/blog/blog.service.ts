import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from './entities/blog.entity';
import { Repository } from 'typeorm';
import { CreateBlogDto, FilterBlogDto } from './dto/blog.dto';
import { generateSlug, randomId } from '../../common/utils/functions.util';
import { BlogStatus } from './enum/status.enum';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import {
  NotFoundMessage,
  PublicMessage,
} from '../../common/enums/message.enum';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import {
  paginationGenerator,
  paginationSolver,
} from '../../common/utils/pagination.util';
import { CategoryService } from '../category/category.service';
import { BlogCategoryEntity } from './entities/blog-category.entity';
import { EntityNames } from '../../common/enums/entity.enum';

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

    let { category, search } = filterDto;

    const qb = this.blogRepository
      .createQueryBuilder(EntityNames.Blog)
      .leftJoinAndSelect('blog.categories', 'categories')
      .leftJoinAndSelect('categories.category', 'category');

    if (category) {
      category = category.toLowerCase();

      qb.andWhere('LOWER(category.title) = :category', { category });
    }

    if (search) {
      search = `%${search}%`;

      qb.andWhere(
        '(blog.title ILIKE :search OR blog.description ILIKE :search OR blog.content ILIKE :search)',
        { search },
      );
    }

    qb.orderBy('blog.id', 'DESC').skip(skip).take(limit).distinct(true); // برای جلوگیری از تکرار در صورت joins

    const [blogs, count] = await qb.getManyAndCount();

    const cleanBlogs = blogs.map((blog) => ({
      ...blog,
      categories: blog.categories.map((c) => ({
        id: c.category.id,
        title: c.category.title,
      })),
    }));

    return {
      pagination: paginationGenerator(count, page, limit),
      blogs: cleanBlogs,
    };

    // let where = '';
    //
    // if (category) {
    //   category = category.toLowerCase();
    //
    //   if (where.length > 0) where += ' AND ';
    //
    //   where += `LOWER(category.title) = :category`;
    // }
    //
    // if (search) {
    //   if (where.length > 0) where += ' AND ';
    //
    //   search = `%${search}%`;
    //
    //   where += `CONCAT(blog.title, blog.description, blog.content) ILIKE :search`;
    // }
    //
    // const [blogs, count] = await this.blogRepository
    //   .createQueryBuilder(EntityNames.Blog)
    //   .leftJoin('blog.categories', 'categories')
    //   .leftJoin('categories.category', 'category')
    //   .addSelect(['categories.id', 'category.id', 'category.title'])
    //   .where(where, { category, search })
    //   .orderBy('blog.id', 'DESC')
    //   .skip(skip)
    //   .take(limit)
    //   .getManyAndCount();

    // const [blogs, count] = await this.blogRepository.findAndCount({
    //   relations: {
    //     categories: {
    //       category: true,
    //     },
    //   },
    //   where,
    //   select: {
    //     categories: {
    //       id: true,
    //       category: {
    //         id: true,
    //         title: true,
    //       },
    //     },
    //   },
    //   order: {
    //     id: 'DESC',
    //   },
    //   skip,
    //   take: limit,
    // });
  }

  async delete(id: number) {
    const { id: userId } = this.request.user!;

    const blog = await this.checkExistBlogById(id);

    if (blog.authorId !== userId)
      throw new NotFoundException(NotFoundMessage.NotFound);

    await this.blogRepository.delete(id);

    return {
      message: PublicMessage.Deleted,
    };
  }

  async checkExistBlogById(id: number) {
    const blog = await this.blogRepository.findOneBy({ id });

    if (!blog) throw new NotFoundException(NotFoundMessage.NotFound);

    return blog;
  }

  async checkBlogBySlug(slug: string) {
    const blog = await this.blogRepository.findOneBy({ slug });

    return !!blog;
  }
}
