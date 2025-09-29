import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateBlogCommentDto } from '../dto/comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from '../entities/blog.entity';
import { Repository } from 'typeorm';
import { BlogCommentEntity } from '../entities/comment.entity';
import { BlogService } from './blog.service';
import {
  BadRequestMessage,
  NotFoundMessage,
  PublicMessage,
} from '../../../common/enums/message.enum';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import {
  paginationGenerator,
  paginationSolver,
} from '../../../common/utils/pagination.util';

@Injectable({ scope: Scope.REQUEST })
export class BlogCommentService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCommentEntity)
    private blogCommentRepository: Repository<BlogCommentEntity>,
    @Inject(REQUEST) private request: Request,
    @Inject(forwardRef(() => BlogService))
    private blogService: BlogService,
  ) {}

  async create(commentDto: CreateBlogCommentDto) {
    const { text, parentId, blogId } = commentDto;

    const { id: userId } = this.request.user!;

    const blog = await this.blogService.checkExistBlogById(blogId);

    let parentComment: BlogCommentEntity | null = null;

    if (parentId) {
      parentComment = await this.blogCommentRepository.findOneBy({
        id: parentId,
      });
    }

    await this.blogCommentRepository.insert({
      text,
      accepted: true,
      blogId,
      parentId: parentComment?.id,
      userId,
    });

    return {
      message: PublicMessage.CreatedComment,
    };
  }

  async blogCommentsList(paginationDto: PaginationDto) {
    const { limit, skip, page } = paginationSolver(paginationDto);

    const [blogComments, count] = await this.blogCommentRepository.findAndCount(
      {
        where: {},
        relations: {
          blog: true,
          user: {
            profile: true,
          },
        },
        select: {
          blog: {
            title: true,
          },
          user: {
            username: true,
            profile: {
              nickName: true,
            },
          },
        },
        order: {
          id: 'DESC',
        },
        skip,
        take: limit,
      },
    );

    return {
      pagination: paginationGenerator(count, page, limit),
      comments: blogComments,
    };
  }

  async findCommentsOfBlogById(blogId: number, paginationDto: PaginationDto) {
    const { limit, skip, page } = paginationSolver(paginationDto);

    const [blogComments, count] = await this.blogCommentRepository.findAndCount(
      {
        where: {
          blogId,
          parentId: undefined,
        },
        relations: {
          blog: true,
          user: {
            profile: true,
          },
          children: {
            user: {
              profile: true,
            },
            children: {
              user: {
                profile: true,
              },
            },
          },
        },
        select: {
          user: {
            username: true,
            profile: {
              nickName: true,
            },
          },
          children: {
            id: true,
            text: true,
            createdAt: true,
            updatedAt: true,
            accepted: true,
            user: {
              username: true,
              profile: {
                nickName: true,
              },
            },
            children: {
              id: true,
              text: true,
              createdAt: true,
              updatedAt: true,
              accepted: true,
              user: {
                username: true,
                profile: {
                  nickName: true,
                },
              },
            },
          },
        },
        order: {
          id: 'DESC',
        },
        skip,
        take: limit,
      },
    );

    return {
      pagination: paginationGenerator(count, page, limit),
      comments: blogComments,
    };
  }

  async checkExistCommentById(id: number) {
    const comment = await this.blogCommentRepository.findOneBy({ id });

    if (!comment) throw new NotFoundException(NotFoundMessage.NotFound);

    return comment;
  }

  async accept(commentId: number) {
    const comment = await this.checkExistCommentById(commentId);

    if (comment.accepted)
      throw new BadRequestException(BadRequestMessage.AlreadyAcceptedComment);

    comment.accepted = true;

    await this.blogCommentRepository.save(comment);

    return {
      message: PublicMessage.Updated,
    };
  }

  async reject(commentId: number) {
    const comment = await this.checkExistCommentById(commentId);

    if (!comment.accepted)
      throw new BadRequestException(BadRequestMessage.AlreadyRejectedComment);

    comment.accepted = false;

    await this.blogCommentRepository.save(comment);

    return {
      message: PublicMessage.Updated,
    };
  }
}
