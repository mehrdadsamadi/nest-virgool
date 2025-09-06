import { Inject, Injectable, Scope } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { isDate } from 'class-validator';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async changeProfile(profileDto: CreateProfileDto) {
    const { id: userId, profileId } = this.request.user as UserEntity;

    let profile = await this.profileRepository.findOneBy({ userId });

    const { gender, birthDate, bio, linkedinProfile, xProfile, nickName } =
      profileDto;

    if (profile) {
      if (bio) profile.bio = bio;
      if (linkedinProfile) profile.linkedinProfile = linkedinProfile;
      if (xProfile) profile.xProfile = xProfile;
      if (nickName) profile.nickName = nickName;
      if (gender) profile.gender = gender;
      if (birthDate && isDate(new Date(birthDate)))
        profile.birthDate = birthDate;
    } else {
      profile = this.profileRepository.create({
        gender,
        birthDate,
        bio,
        linkedinProfile,
        xProfile,
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
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
