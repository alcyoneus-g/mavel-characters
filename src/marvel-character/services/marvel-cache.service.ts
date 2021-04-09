import { Inject, Logger } from '@nestjs/common';
import NodeCache from 'node-cache';
import sleep from 'sleep-promise';
import { IdListDto } from '../dtos/id-list.dto';
import { MarvelServerService } from './marvel-server.service';
import { MARVEL_CACHE, MARVEL_CHARACTERS_DEFERRED_KEY } from '../constants';
import { Deferred } from 'ts-deferred';

export class MarvelCacheService {
  private readonly logger = new Logger(MarvelCacheService.name);

  constructor(
    @Inject(MARVEL_CACHE) private readonly marvelCache: NodeCache,
    private readonly marvelServerService: MarvelServerService,
  ) {}

  ensureCacheInitialized() {
    const listDeferred = this.marvelCache.get<Deferred<IdListDto>>(
      MARVEL_CHARACTERS_DEFERRED_KEY,
    );

    if (!listDeferred) {
      this.initializeCache();
    }
  }

  async initializeCache() {
    this.refreshCache();
    this.startCacheUpdater();
  }

  async refreshCache() {
    this.logger.log('Refreshing characters cache...');

    const deferred = new Deferred();
    this.marvelCache.set(MARVEL_CHARACTERS_DEFERRED_KEY, deferred);

    const list = await this.marvelServerService.getCharacterList();

    this.logger.log('Refreshed characters cache...');
    deferred.resolve(list);
  }

  async startCacheUpdater() {
    const scheduleCacheUpdater = async () => {
      await sleep(5000);

      if (await this.isCacheUpdated()) {
        await this.refreshCache();
      }

      scheduleCacheUpdater();
    };

    await scheduleCacheUpdater();
  }

  async isCacheUpdated() {
    try {
      const onlineSize = await this.marvelServerService.getCharacterListSize();

      const list = await this.marvelCache.get<Deferred<IdListDto>>(
        MARVEL_CHARACTERS_DEFERRED_KEY,
      ).promise;

      return onlineSize === list.size;
    } catch (e) {
      this.logger.error('Failed to fetch online size');
      this.logger.error(e);
      return false;
    }
  }
}
