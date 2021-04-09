import { HttpModule, HttpService, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import NodeCache from 'node-cache';
import { MARVEL_CACHE } from './constants';
import { MarvelCharacterController } from './controllers/marvel-character.controller';
import { MarvelCharacterProvider } from './providers/marvel-character.provider';
import { MarvelCacheService } from './services/marvel-cache.service';
import { MarvelServerService } from './services/marvel-server.service';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [MarvelCharacterController],
  providers: [
    {
      provide: MARVEL_CACHE,
      useFactory: () => new NodeCache(),
    },
    {
      provide: MarvelServerService,
      useFactory: (config: ConfigService, httpService: HttpService) =>
        new MarvelServerService(
          httpService,
          config.get('BASE_URL'),
          config.get('PUBLIC_KEY'),
          config.get('PRIVATE_KEY'),
        ),
      inject: [ConfigService, HttpService],
    },
    MarvelCharacterProvider,
    MarvelCacheService,
  ],
})
export class MarvelCharacterModule {}
