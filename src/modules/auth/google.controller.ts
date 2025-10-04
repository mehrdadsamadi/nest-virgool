import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GoogleUser } from './types/response';

@Controller('/auth/google')
@ApiTags('Google Auth')
@UseGuards(AuthGuard('google'))
export class GoogleAuthController {
  constructor(private authService: AuthService) {}

  @Get()
  googleLogin(@Req() req) {}

  @Get('/redirect')
  googleRedirect(@Req() req) {
    const userData = req.user as GoogleUser;

    return this.authService.googleAuth(userData);
  }
}
