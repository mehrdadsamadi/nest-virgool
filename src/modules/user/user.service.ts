import { Inject, Injectable, Scope } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { isDate } from 'class-validator';
import { ProfileImages } from './types/files';
import { PublicMessage } from '../../common/enums/message.enum';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async changeProfile(files: ProfileImages, profileDto: CreateProfileDto) {
    if (files?.imageProfile?.length > 0) {
      const [image] = files.imageProfile;
      profileDto.imageProfile = image.path
        .replace('public', '')
        .replace(/\\/g, '/');
    }
    if (files?.bgImage?.length > 0) {
      const [image] = files.bgImage;
      profileDto.bgImage = image.path.replace('public', '').replace(/\\/g, '/');
    }

    const { id: userId, profileId } = this.request.user!;

    let profile = await this.profileRepository.findOneBy({ userId });

    const {
      gender,
      birthDate,
      bio,
      linkedinProfile,
      xProfile,
      nickName,
      imageProfile,
      bgImage,
    } = profileDto;

    if (profile) {
      if (bio) profile.bio = bio;
      if (linkedinProfile) profile.linkedinProfile = linkedinProfile;
      if (xProfile) profile.xProfile = xProfile;
      if (nickName) profile.nickName = nickName;
      if (gender) profile.gender = gender;
      if (gender) profile.imageProfile = imageProfile;
      if (gender) profile.bgImage = bgImage;
      if (birthDate && isDate(new Date(birthDate)))
        profile.birthDate = birthDate;
    } else {
      profile = this.profileRepository.create({
        gender,
        birthDate,
        bio,
        linkedinProfile,
        xProfile,
        imageProfile,
        bgImage,
        nickName,
        userId,
      });
    }

    profile = await this.profileRepository.save(profile);

    if (!profileId) {
      await this.userRepository.update(
        { id: userId },
        { profileId: profile.id },
      );
    }

    return {
      message: PublicMessage.Updated,
    };
  }

  async profile() {
    const { id } = this.request.user!;

    return await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });
  }
}
