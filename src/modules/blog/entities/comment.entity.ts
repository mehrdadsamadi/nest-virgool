import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { EntityNames } from '../../../common/enums/entity.enum';
import { UserEntity } from '../../user/entities/user.entity';
import { BlogEntity } from './blog.entity';

@Entity(EntityNames.BlogComments)
export class BlogCommentEntity extends BaseEntity {
  @Column()
  text: string;

  @Column({ default: true })
  accepted: boolean;

  @Column({ nullable: true })
  parentId: number;

  @ManyToOne(() => BlogCommentEntity, (blogComment) => blogComment.children, {
    onDelete: 'CASCADE',
  })
  parent: BlogCommentEntity;

  @OneToMany(() => BlogCommentEntity, (blogComment) => blogComment.parent)
  @JoinColumn({ name: 'parent' })
  children: BlogCommentEntity[];

  @Column()
  blogId: number;

  @ManyToOne(() => BlogEntity, (blog) => blog.comments, { onDelete: 'CASCADE' })
  blog: BlogEntity;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.blogComments, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
