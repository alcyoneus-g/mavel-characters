import { Inject, Injectable } from '@nestjs/common';
import NodeCache from 'node-cache';
import { Deferred } from 'ts-deferred';
import { IdListDto } from '../dtos/id-list.dto';
import { MARVEL_CACHE, MARVEL_CHARACTERS_DEFERRED_KEY } from '../constants';
import { MarvelServerService } from '../services/marvel-server.service';
import { MarvelCharacterDto } from '../dtos/marvel-character.dto';
import { MarvelCacheService } from '../services/marvel-cache.service';

@Injectable()
export class MarvelCharacterProvider {
  constructor(
    @Inject(MARVEL_CACHE) private readonly marvelCache: NodeCache,
    private readonly marvelCacheService: MarvelCacheService,
    private readonly marvelServerService: MarvelServerService,
  ) {}

  /**
   * Get list of all character ids
   *
   * @returns Array of all character ids
   */
  async getCharacterList(): Promise<number[]> {
    // ensure cache is initialized before reading cache
    this.marvelCacheService.ensureCacheInitialized();

    // get deferred and wait until it's done
    const listDeferred = this.marvelCache.get<Deferred<IdListDto>>(
      MARVEL_CHARACTERS_DEFERRED_KEY,
    );

    const list = await listDeferred.promise;
    return list.items;
  }

  /**
   * Get details of single character by id
   *
   * @param id Id of character
   * @returns Character details
   */
  async getCharacter(id: number): Promise<MarvelCharacterDto> {
    return await this.marvelServerService.getCharacter(id);
  }
}
