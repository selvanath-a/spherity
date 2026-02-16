import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { TimingInterceptor } from './common/interceptors/timing/timing.interceptor';
import { ValidationPipe } from '@nestjs/common';

/**
 * Bootstraps the NestJS application.
 * Configures cookie parsing, CORS settings, and starts the HTTP server.
 *
 * Environment variables:
 * - CORS_ORIGIN: Allowed origin for CORS (default: http://localhost:3000)
 * - PORT: Server port (default: 3001)
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TimingInterceptor());

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
void bootstrap();
