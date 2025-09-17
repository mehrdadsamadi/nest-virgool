import { Column, Entity, ManyToOne } from 'typeorm';
import { EntityNames } from '../../../common/enums/entity.enum';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { BlogEntity } from './blog.entity';
import { CategoryEntity } from '../../category/entities/category.entity';

@Entity(EntityNames.BlogCategory)
export class BlogCategoryEntity extends BaseEntity {
  @Column()
  blogId: number;

  @Column()
  categoryId: number;

  @ManyToOne(() => BlogEntity, (blog) => blog.categories, {
    onDelete: 'CASCADE',
  })
  blog: BlogEntity;

  @ManyToOne(() => CategoryEntity, (category) => category.blogCategories, {
    onDelete: 'CASCADE',
  })
  category: CategoryEntity;
}
