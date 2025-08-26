import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { swaggerConfigInit } from './config/swagger.config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { PORT, COOKIE_SECRET } = process.env;

  swaggerConfigInit(app);

  app.use(cookieParser(COOKIE_SECRET));

  await app.listen(PORT, () => {
    console.log(`App : http://localhost:${PORT}`);
    console.log(`Swagger : http://localhost:${PORT}/swagger`);
  });
}
bootstrap();
