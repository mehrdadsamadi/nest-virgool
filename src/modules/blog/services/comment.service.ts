import { Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { CreateBlogCommentDto } from '../dto/comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogEntity } from '../entities/blog.entity';
import { Repository } from 'typeorm';
import { BlogCommentEntity } from '../entities/comment.entity';
import { BlogService } from './blog.service';
import { PublicMessage } from '../../../common/enums/message.enum';

@Injectable({ scope: Scope.REQUEST })
export class BlogCommentService {
  constructor(
    @InjectRepository(BlogEntity)
    private blogRepository: Repository<BlogEntity>,
    @InjectRepository(BlogCommentEntity)
    private blogCommentRepository: Repository<BlogCommentEntity>,
    @Inject(REQUEST) private request: Request,
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
}
