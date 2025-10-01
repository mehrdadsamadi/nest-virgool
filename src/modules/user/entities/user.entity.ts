import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { EntityNames } from '../../../common/enums/entity.enum';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { OtpEntity } from './otp.entity';
import { ProfileEntity } from './profile.entity';
import { BlogEntity } from '../../blog/entities/blog.entity';
import { BlogLikesEntity } from '../../blog/entities/like.entity';
import { BlogBookmarkEntity } from '../../blog/entities/bookmark.entity';
import { BlogCommentEntity } from '../../blog/entities/comment.entity';
import { ImageEntity } from '../../image/entities/image.entity';
import { Roles } from '../../../common/enums/role.enum';
import { FollowEntity } from './follow.entity';

@Entity(EntityNames.User)
export class UserEntity extends BaseEntity {
  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ default: Roles.User, enum: Roles })
  role: Roles;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ nullable: true })
  newPhone: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  newEmail: string;

  @Column({ nullable: true, default: false })
  verifyEmail: boolean;

  @Column({ nullable: true, default: false })
  verifyPhone: boolean;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  otpId: number;

  @OneToOne(() => OtpEntity, (otp) => otp.user, { nullable: true })
  @JoinColumn()
  otp: OtpEntity;

  @Column({ nullable: true })
  profileId: number;

  @OneToOne(() => ProfileEntity, (profile) => profile.user, { nullable: true })
  @JoinColumn()
  profile: ProfileEntity;

  @OneToMany(() => BlogEntity, (blog) => blog.author)
  blogs: BlogEntity[];

  @OneToMany(() => BlogLikesEntity, (blogLikes) => blogLikes.user)
  blogLikes: BlogLikesEntity[];

  @OneToMany(() => BlogBookmarkEntity, (blogBookmark) => blogBookmark.user)
  blogBookmarks: BlogBookmarkEntity[];

  @OneToMany(() => BlogCommentEntity, (blogComment) => blogComment.user)
  blogComments: BlogCommentEntity[];

  @OneToMany(() => ImageEntity, (image) => image.user)
  images: ImageEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.follower)
  followings: FollowEntity[];

  @OneToMany(() => FollowEntity, (follow) => follow.following)
  followers: FollowEntity[];
}
