import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { SwaggerAuthName } from '../enums/swagger-auth-name.enum';
import { AuthGuard } from '../../modules/auth/guards/auth.guard';

export function AuthDecorator() {
  return applyDecorators(
    ApiBearerAuth(SwaggerAuthName.Authorization),
    UseGuards(AuthGuard),
  );
}
