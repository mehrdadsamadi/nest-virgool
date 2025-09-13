import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { EntityNames } from '../../../common/enums/entity.enum';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { OtpEntity } from './otp.entity';
import { ProfileEntity } from './profile.entity';

@Entity(EntityNames.User)
export class UserEntity extends BaseEntity {
  @Column({ unique: true, nullable: true })
  username: string;

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
}
