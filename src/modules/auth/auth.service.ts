import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthType } from './enums/type.enum';
import { AuthMethod } from './enums/method.enum';
import { isEmail, isMobilePhone } from 'class-validator';

@Injectable()
export class AuthService {
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

  login(method: AuthMethod, username: string) {
    return this.usernameValidator(method, username);
  }
  register(method: AuthMethod, username: string) {
    return this.usernameValidator(method, username);
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
