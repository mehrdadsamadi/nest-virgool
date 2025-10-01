import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileEntity } from './entities/profile.entity';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { isDate } from 'class-validator';
import { ProfileImages } from './types/files';
import {
  AuthMessage,
  BadRequestMessage,
  ConflictMessage,
  NotFoundMessage,
  PublicMessage,
} from '../../common/enums/message.enum';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../auth/tokens.service';
import { OtpEntity } from './entities/otp.entity';
import { CookieKeys } from '../../common/enums/cookie.enum';
import { AuthMethod } from '../auth/enums/method.enum';
import { FollowEntity } from './entities/follow.entity';
import { EntityNames } from '../../common/enums/entity.enum';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import {
  paginationGenerator,
  paginationSolver,
} from '../../common/utils/pagination.util';
import { UserBlockDto } from '../auth/dto/auth.dto';
import { UserStatus } from './enum/status.enum';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,
    @InjectRepository(FollowEntity)
    private followRepository: Repository<FollowEntity>,
    @Inject(REQUEST) private request: Request,
    private authService: AuthService,
    private tokenService: TokenService,
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

  profile() {
    const { id } = this.request.user!;

    return this.userRepository
      .createQueryBuilder(EntityNames.User)
      .where({ id })
      .leftJoinAndSelect('user.profile', 'profile')
      .loadRelationCountAndMap('user.followers', 'user.followers')
      .loadRelationCountAndMap('user.followings', 'user.followings')
      .getOne();
  }

  async changeEmail(email: string) {
    const { id } = this.request.user!;

    const tempUser = await this.userRepository.findOneBy({ email });

    if (tempUser && tempUser?.id !== id) {
      throw new ConflictException(ConflictMessage.Email);
    } else if (tempUser && tempUser.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }

    await this.userRepository.update({ id }, { newEmail: email });

    const otp = await this.authService.saveOtp(id, AuthMethod.Email);

    const emailToken = this.tokenService.generateEmailToken({ email });

    return {
      code: otp.code,
      token: emailToken,
    };
  }

  async verifyEmail(code: string) {
    const { id: userId, newEmail } = this.request.user!;

    const token = this.request.cookies?.[CookieKeys.EmailOtp] as string;
    if (!token) throw new BadRequestException(AuthMessage.ExpiredCode);

    const { email } = this.tokenService.verifyEmailToken(token);
    if (email !== newEmail)
      throw new BadRequestException(BadRequestMessage.SomethingWentWrong);

    const otp = await this.checkOtp(userId, code);

    if (otp.authMethod !== AuthMethod.Email)
      throw new BadRequestException(BadRequestMessage.SomethingWentWrong);

    await this.userRepository.update(
      { id: userId },
      {
        email,
        verifyEmail: true,
        newEmail: '',
      },
    );

    return {
      message: PublicMessage.Updated,
    };
  }

  async changePhone(phone: string) {
    const { id } = this.request.user!;

    const tempUser = await this.userRepository.findOneBy({ phone });

    if (tempUser && tempUser?.id !== id) {
      throw new ConflictException(ConflictMessage.Phone);
    } else if (tempUser && tempUser.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }

    await this.userRepository.update({ id }, { newPhone: phone });

    const otp = await this.authService.saveOtp(id, AuthMethod.Phone);

    const phoneToken = this.tokenService.generatePhoneToken({ phone });

    return {
      code: otp.code,
      token: phoneToken,
    };
  }

  async verifyPhone(code: string) {
    const { id: userId, newPhone } = this.request.user!;

    const token = this.request.cookies?.[CookieKeys.PhoneOtp] as string;
    if (!token) throw new BadRequestException(AuthMessage.ExpiredCode);

    const { phone } = this.tokenService.verifyPhoneToken(token);
    if (phone !== newPhone)
      throw new BadRequestException(BadRequestMessage.SomethingWentWrong);

    const otp = await this.checkOtp(userId, code);

    if (otp.authMethod !== AuthMethod.Phone)
      throw new BadRequestException(BadRequestMessage.SomethingWentWrong);

    await this.userRepository.update(
      { id: userId },
      {
        phone,
        verifyPhone: true,
        newPhone: '',
      },
    );

    return {
      message: PublicMessage.Updated,
    };
  }

  async changeUsername(username: string) {
    const { id } = this.request.user!;

    const tempUser = await this.userRepository.findOneBy({ username });

    if (tempUser && tempUser?.id !== id) {
      throw new ConflictException(ConflictMessage.Username);
    } else if (tempUser && tempUser.id == id) {
      return {
        message: PublicMessage.Updated,
      };
    }

    await this.userRepository.update({ id }, { username });

    return {
      message: PublicMessage.Updated,
    };
  }

  async checkOtp(userId: number, code: string) {
    const otp = await this.otpRepository.findOneBy({ userId });

    if (!otp) throw new BadRequestException(NotFoundMessage.NotFound);

    const now = new Date();
    if (otp.expireIn < now)
      throw new BadRequestException(AuthMessage.ExpiredCode);

    if (otp.code !== code)
      throw new BadRequestException(AuthMessage.IncorrectOtpCode);

    return otp;
  }

  async list(paginationDto: PaginationDto) {
    const { limit, skip, page } = paginationSolver(paginationDto);

    const [users, count] = await this.userRepository.findAndCount({
      take: limit,
      skip,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      users,
      pagination: paginationGenerator(count, page, limit),
    };
  }

  async followers(paginationDto: PaginationDto) {
    const { limit, skip, page } = paginationSolver(paginationDto);

    const userId = this.request.user?.id;

    const [followers, count] = await this.followRepository.findAndCount({
      where: { followingId: userId },
      relations: {
        follower: {
          profile: true,
        },
      },
      select: {
        id: true,
        follower: {
          id: true,
          username: true,
          profile: {
            id: true,
            nickName: true,
            bio: true,
            imageProfile: true,
            bgImage: true,
          },
        },
      },
      take: limit,
      skip,
      // order: {
      //   createdAt: 'DESC',
      // },
    });

    return {
      followers,
      pagination: paginationGenerator(count, page, limit),
    };
  }

  async followings(paginationDto: PaginationDto) {
    const { limit, skip, page } = paginationSolver(paginationDto);

    const userId = this.request.user?.id;

    const [followings, count] = await this.followRepository.findAndCount({
      where: { followerId: userId },
      relations: {
        following: {
          profile: true,
        },
      },
      select: {
        id: true,
        following: {
          id: true,
          username: true,
          profile: {
            id: true,
            nickName: true,
            bio: true,
            imageProfile: true,
            bgImage: true,
          },
        },
      },
      take: limit,
      skip,
      // order: {
      //   createdAt: 'DESC',
      // },
    });

    return {
      followings,
      pagination: paginationGenerator(count, page, limit),
    };
  }

  async followToggle(followingId: number) {
    const { id: userId } = this.request.user!;

    const following = await this.userRepository.findOneBy({ id: followingId });
    if (!following) throw new BadRequestException(NotFoundMessage.User);

    const isFollowing = await this.followRepository.findOneBy({
      followingId,
      followerId: userId,
    });

    let message = PublicMessage.Followed;

    if (isFollowing) {
      await this.followRepository.remove(isFollowing);
      message = PublicMessage.UnFollowed;
    } else {
      await this.followRepository.insert({
        followingId,
        followerId: userId,
      });
    }

    return { message };
  }

  async blockToggle(blockDto: UserBlockDto) {
    const { userId } = blockDto;

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException(NotFoundMessage.User);

    let message = PublicMessage.UserBlocked;

    if (user.status === UserStatus.BLOCK) {
      message = PublicMessage.UserUnBlocked;

      await this.userRepository.update(
        { id: userId },
        { status: UserStatus.ACTIVE },
      );
    } else {
      await this.userRepository.update(
        { id: userId },
        { status: UserStatus.BLOCK },
      );
    }

    return { message };
  }
}
