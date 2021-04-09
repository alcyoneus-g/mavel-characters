import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MarvelCharacterModule } from './marvel-character/marvel-character.module';

async function bootstrap() {
  const app = await NestFactory.create(MarvelCharacterModule);

  const config = new DocumentBuilder()
    .setTitle('Marvel Characters')
    .setDescription('Marvel Characters API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
