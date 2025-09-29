// add user to request without validation
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../modules/auth/auth.service';
import { isJWT } from 'class-validator';

@Injectable()
export class AddUserToReqWOVMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = this.extractToken(req);

    if (!token) return next();

    try {
      const user = await this.authService.validateAccessToken(token);
      if (user) req.user = user;
    } catch (error) {
      console.log(error);
    }

    next();
  }

  protected extractToken(request: Request) {
    const { authorization } = request.headers;
    if (!authorization || authorization.trim() === '') {
      return null;
    }

    const [bearer, token] = authorization.split(' ');
    if (bearer?.toLocaleLowerCase() !== 'bearer' || !token || !isJWT(token)) {
      return null;
    }

    return token;
  }
}
