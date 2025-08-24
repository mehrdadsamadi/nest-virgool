import { Column, Entity } from 'typeorm';
import { EntityNames } from '../../../common/enums/entity.enum';
import { BaseEntity } from '../../../common/abstracts/base.entity';

@Entity(EntityNames.Profile)
export class ProfileEntity extends BaseEntity {
  @Column()
  nickName: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  imageProfile: string;

  @Column({ nullable: true })
  bgImage: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  linkedinProfile: string;
}
