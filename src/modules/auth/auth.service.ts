import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
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
  PublicMessage,
} from '../../common/enums/message.enum';
import { OtpEntity } from '../user/entities/otp.entity';
import { randomInt } from 'crypto';
import { TokenService } from './tokens.service';
import { Request, Response } from 'express';
import { CookieKeys } from '../../common/enums/cookie.enum';
import { AuthResponse } from './types/response';
import { REQUEST } from '@nestjs/core';
import { OtpCookieOptions } from '../../common/utils/functions.util';
import { KavenegarService } from '../http/kavenegar.service';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,
    @Inject(REQUEST) private request: Request,
    private tokenService: TokenService,
    private kavenegarService: KavenegarService,
  ) {}
  async userExistence(authDto: AuthDto, res: Response) {
    const { type, method, username } = authDto;

    let result: AuthResponse;

    switch (type) {
      case AuthType.Login:
        result = await this.login(method, username);
        await this.sendOtp(method, username, result.code);
        break;

      case AuthType.Register:
        result = await this.register(method, username);
        await this.sendOtp(method, username, result.code);
        break;

      default:
        throw new UnauthorizedException();
    }

    return this.sendResponse(res, result);
  }

  async login(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);

    const user = await this.checkExistUser(method, validUsername);
    if (!user) throw new UnauthorizedException(AuthMessage.NotFoundAccount);

    const otp = await this.saveOtp(user.id, method);

    const otpToken = this.tokenService.generateOtpToken({ userId: user.id });

    return {
      code: otp.code,
      token: otpToken,
    };
  }

  async register(method: AuthMethod, username: string) {
    const validUsername = this.usernameValidator(method, username);

    let user = await this.checkExistUser(method, validUsername);
    if (user) throw new ConflictException(AuthMessage.AlreadyExistAccount);

    if (method === AuthMethod.Username) {
      throw new BadRequestException(BadRequestMessage.InvalidRegisterData);
    }

    user = this.userRepository.create({
      [method]: validUsername,
    });

    user = await this.userRepository.save(user);

    user.username = `m_${user.id}`;
    await this.userRepository.save(user);

    const otp = await this.saveOtp(user.id, method);

    const otpToken = this.tokenService.generateOtpToken({ userId: user.id });

    return {
      code: otp.code,
      token: otpToken,
    };
  }

  sendResponse(res: Response, result: AuthResponse) {
    const { token, code } = result;

    res.cookie(CookieKeys.Otp, token, OtpCookieOptions());

    res.json({
      message: PublicMessage.SentOpt,
      code,
    });
  }

  async sendOtp(method: AuthMethod, username: string, code: string) {
    if (method === AuthMethod.Phone) {
      await this.kavenegarService.sendVerificationSms(username, code);
    } else if (method === AuthMethod.Email) {
      // send email
    }
  }

  async saveOtp(userId: number, method: AuthMethod) {
    const code = randomInt(10000, 99999).toString();

    let existOtp = false;

    const expireIn = new Date(Date.now() + 1000 * 60 * 2);

    let otp = await this.otpRepository.findOneBy({ userId });
    if (otp) {
      existOtp = true;
      otp.code = code;
      otp.expireIn = expireIn;
      otp.authMethod = method;
    } else {
      otp = this.otpRepository.create({
        userId,
        code,
        expireIn,
        authMethod: method,
      });
    }

    otp = await this.otpRepository.save(otp);

    if (!existOtp) {
      await this.userRepository.update({ id: userId }, { otpId: otp.id });
    }

    return otp;
  }

  async checkOtp(code: string) {
    const token = this.request.cookies?.[CookieKeys.Otp] as string;
    if (!token) throw new UnauthorizedException(AuthMessage.ExpiredCode);

    const { userId } = this.tokenService.verifyOtpToken(token);

    const otp = await this.otpRepository.findOneBy({ userId });
    if (!otp) throw new UnauthorizedException(AuthMessage.TryAgain);

    const now = new Date();
    if (otp.expireIn < now)
      throw new UnauthorizedException(AuthMessage.ExpiredCode);

    if (otp.code !== code)
      throw new UnauthorizedException(AuthMessage.IncorrectOtpCode);

    const accessToken = this.tokenService.generateAccessToken({ userId });

    let verifyQuery = {};

    if (otp.authMethod === AuthMethod.Email) {
      verifyQuery = {
        verifyEmail: true,
      };
    } else if (otp.authMethod === AuthMethod.Phone) {
      verifyQuery = {
        verifyPhone: true,
      };
    }

    await this.userRepository.update({ id: userId }, verifyQuery);

    return {
      accessToken,
    };
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

  async validateAccessToken(token: string) {
    const { userId } = this.tokenService.verifyAccessToken(token);

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException(AuthMessage.LoginAgain);
    }

    return user;
  }
}
