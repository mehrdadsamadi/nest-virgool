import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('/auth/google')
@ApiTags('Google Auth')
@UseGuards(AuthGuard('google'))
export class GoogleAuthController {
  @Get()
  googleLogin(@Req() req) {}

  @Get('/redirect')
  googleRedirect(@Req() req) {
    return req.user;
  }
}
