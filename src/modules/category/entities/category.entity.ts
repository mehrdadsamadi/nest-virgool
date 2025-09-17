import { Column, Entity, OneToMany } from 'typeorm';
import { EntityNames } from '../../../common/enums/entity.enum';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { BlogCategoryEntity } from '../../blog/entities/blog-category.entity';

@Entity(EntityNames.Category)
export class CategoryEntity extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  priority: number;

  @OneToMany(() => BlogCategoryEntity, (blogCategory) => blogCategory.category)
  blogCategories: BlogCategoryEntity[];
}
