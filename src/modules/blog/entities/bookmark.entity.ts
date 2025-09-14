import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { EntityNames } from '../../../common/enums/entity.enum';
import { UserEntity } from '../../user/entities/user.entity';
import { BlogEntity } from './blog.entity';

@Entity(EntityNames.BlogBookmark)
export class BlogBookmarkEntity extends BaseEntity {
  @Column()
  blogId: number;

  @ManyToOne(() => BlogEntity, (blog) => blog.bookmarks, {
    onDelete: 'CASCADE',
  })
  blog: BlogEntity;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.blogBookmarks, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;
}
