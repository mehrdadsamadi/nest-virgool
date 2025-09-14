import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { EntityNames } from '../../../common/enums/entity.enum';
import { BlogStatus } from '../enum/status.enum';
import { UserEntity } from '../../user/entities/user.entity';
import { BlogLikesEntity } from './like.entity';
import { BlogBookmarkEntity } from './bookmark.entity';
import { BlogCommentEntity } from './comment.entity';

@Entity(EntityNames.Blog)
export class BlogEntity extends BaseEntity {
  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  image: string;

  @Column()
  authorId: number;

  @ManyToOne(() => UserEntity, (user) => user.blogs, { onDelete: 'CASCADE' })
  author: UserEntity;

  @Column({ default: BlogStatus.DRAFT, enum: BlogStatus })
  status: BlogStatus;

  @OneToMany(() => BlogLikesEntity, (blogLikes) => blogLikes.blog)
  likes: BlogLikesEntity[];

  @OneToMany(() => BlogBookmarkEntity, (blogBookmarks) => blogBookmarks.blog)
  bookmarks: BlogBookmarkEntity[];

  @OneToMany(() => BlogCommentEntity, (blogComment) => blogComment.blog)
  comments: BlogCommentEntity[];
}
