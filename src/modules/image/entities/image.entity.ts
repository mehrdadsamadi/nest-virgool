import { BaseEntity } from '../../../common/abstracts/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { EntityNames } from '../../../common/enums/entity.enum';
import { UserEntity } from '../../user/entities/user.entity';

@Entity(EntityNames.Image)
export class ImageEntity extends BaseEntity {
  @Column()
  name: string;

  @Column()
  location: string;

  @Column()
  alt: string;

  @Column()
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.images, { onDelete: 'CASCADE' })
  user: UserEntity;
}
