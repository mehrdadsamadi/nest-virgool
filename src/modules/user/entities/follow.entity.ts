import { Column, Entity, ManyToOne } from 'typeorm';
import { EntityNames } from '../../../common/enums/entity.enum';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { UserEntity } from './user.entity';

@Entity(EntityNames.Follow)
export class FollowEntity extends BaseEntity {
  @Column()
  followingId: number;

  @ManyToOne(() => UserEntity, (user) => user.followers, {
    onDelete: 'CASCADE',
  })
  following: UserEntity;

  @Column()
  followerId: number;

  @ManyToOne(() => UserEntity, (user) => user.followings, {
    onDelete: 'CASCADE',
  })
  follower: UserEntity;
}
