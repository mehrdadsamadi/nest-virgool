import { Column, Entity, OneToOne } from 'typeorm';
import { EntityNames } from '../../../common/enums/entity.enum';
import { BaseEntity } from '../../../common/abstracts/base.entity';
import { UserEntity } from './user.entity';
import { AuthMethod } from '../../auth/enums/method.enum';

@Entity(EntityNames.Otp)
export class OtpEntity extends BaseEntity {
  @Column()
  code: string;

  @Column()
  expireIn: Date;

  @Column({ nullable: true, enum: AuthMethod })
  authMethod: AuthMethod;

  @Column()
  userId: number;

  @OneToOne(() => UserEntity, (user) => user.otp, { onDelete: 'CASCADE' })
  user: UserEntity;
}
