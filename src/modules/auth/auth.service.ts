import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthType } from './enums/type.enum';
import { AuthMethod } from './enums/method.enum';
import { isEmail, isMobilePhone } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { ProfileEntity } from '../user/entities/profile.entity';
import {
  AuthMessage,
  BadRequestMessage,
} from '../../common/enums/message.enum';
import { OtpEntity } from '../user/entities/otp.entity';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,
  ) {}
  userExistence(authDto: AuthDto) {
    const { type, method, username } = authDto;

    switch (type) {
      case AuthType.Login:
        return this.login(method, username);

      case AuthType.Register:
        return this.register(method, username);

      default:
        throw new UnauthorizedException();
    }
  }

  async login(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);

    const user = await this.checkExistUser(method, validUsername);
    if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount);

    const otp = await this.saveOtp(user.id);

    return {
      code: otp.code,
    };
  }

  async register(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);

    let user = await this.checkExistUser(method, validUsername);
    if (user) throw new ConflictException(AuthMessage.AlreadyExistAccount);

    user = this.userRepository.create({
      [method]: validUsername,
    });

    user = await this.userRepository.save(user);

    const otp = await this.saveOtp(user.id);

    return {
      code: otp.code,
    };
  }

  async saveOtp(userId: number) {
    const code = randomInt(10000, 99999).toString();

    let existOtp = false;

    const expireIn = new Date(Date.now() + 1000 * 60 * 2);

    let otp = await this.otpRepository.findOneBy({ userId });
    if (otp) {
      existOtp = true;
      otp.code = code;
      otp.expireIn = expireIn;
    } else {
      otp = this.otpRepository.create({ userId, code, expireIn });
    }

    otp = await this.otpRepository.save(otp);

    if (!existOtp) {
      await this.userRepository.update({ id: userId }, { otpId: otp.id });
    }

    return otp;
  }

  async checkExistUser(method: AuthMethod, username: string) {
    let user: UserEntity | null;

    if (method === AuthMethod.Phone) {
      user = await this.userRepository.findOneBy({ phone: username });
    } else if (method === AuthMethod.Email) {
      user = await this.userRepository.findOneBy({ email: username });
    } else if (method === AuthMethod.Username) {
      user = await this.userRepository.findOneBy({ username });
    } else {
      throw new BadRequestException(BadRequestMessage.InvalidLoginData);
    }

    return user;
  }

  usernameValidator(method: AuthMethod, username: string) {
    switch (method) {
      case AuthMethod.Email:
        if (isEmail(username)) return username;
        throw new BadRequestException('Invalid email address');

      case AuthMethod.Phone:
        if (isMobilePhone(username, 'fa-IR')) return username;
        throw new BadRequestException('Invalid phone number');

      case AuthMethod.Username:
        return username;

      default:
        throw new UnauthorizedException('username field is invalid');
    }
  }
}
