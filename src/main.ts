import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { setupGracefulShutdown } from 'nestjs-graceful-shutdown';
import { EnvironmentConfig } from './config/environment.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('SpeClarify REST API')
    .setDescription(
      'SpeClarify REST API for Requirements Engineering automations.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  setupGracefulShutdown({ app });

  const environmentConfig = app.get(EnvironmentConfig);
  const port = environmentConfig.getNumberFromEnv('SERVER_PORT');

  await app.listen(port);
}

bootstrap();
