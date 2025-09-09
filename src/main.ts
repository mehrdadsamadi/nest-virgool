import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { swaggerConfigInit } from './config/swagger.config';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const { PORT, COOKIE_SECRET } = process.env;

  swaggerConfigInit(app);

  app.use(cookieParser(COOKIE_SECRET));

  app.useStaticAssets('public');

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT, () => {
    console.log(`App : http://localhost:${PORT}`);
    console.log(`Swagger : http://localhost:${PORT}/swagger`);
  });
}
bootstrap();
