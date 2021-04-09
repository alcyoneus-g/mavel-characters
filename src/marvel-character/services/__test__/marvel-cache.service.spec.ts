jest.mock('sleep-promise', () =>
  jest.fn().mockImplementation(() => Promise.resolve()),
);

import { Test } from '@nestjs/testing';
import NodeCache from 'node-cache';
import { Deferred } from 'ts-deferred';
import { MarvelCacheService } from '../marvel-cache.service';
import { MarvelServerService } from '../marvel-server.service';
import { MARVEL_CACHE, MARVEL_CHARACTERS_DEFERRED_KEY } from '../../constants';
import { mockMarvelServerService, mockNodeCache } from '../../__test__/common';
import sleep from 'sleep-promise';

describe('MarvelCacheService', () => {
  let marvelCacheService: MarvelCacheService;
  let marvelCache: jest.Mocked<NodeCache>;
  let marvelServerService: jest.Mocked<MarvelServerService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MarvelCacheService,
        {
          provide: MARVEL_CACHE,
          useFactory: mockNodeCache,
        },
        {
          provide: MarvelServerService,
          useFactory: mockMarvelServerService,
        },
      ],
    }).compile();

    marvelCache = module.get(MARVEL_CACHE);
    marvelCacheService = module.get(MarvelCacheService);
    marvelServerService = module.get(MarvelServerService);
  });

  describe('ensureCacheInitialized', () => {
    it('should ensure cache is initialized', async () => {
      marvelCacheService.initializeCache = jest.fn();
      marvelCache.get.mockReturnValue(undefined);

      marvelCacheService.ensureCacheInitialized();

      expect(marvelCacheService.initializeCache).toBeCalled();
    });

    it('should do nothing if cache is initialized', async () => {
      marvelCacheService.initializeCache = jest.fn();
      marvelCache.get.mockReturnValue(1);

      marvelCacheService.ensureCacheInitialized();

      expect(marvelCacheService.initializeCache).not.toBeCalled();
    });
  });

  describe('initializeCache', () => {
    it('should call initialize cache', async () => {
      marvelCacheService.refreshCache = jest.fn();
      marvelCacheService.startCacheUpdater = jest.fn();

      marvelCacheService.initializeCache();

      expect(marvelCacheService.refreshCache).toBeCalled();
      expect(marvelCacheService.startCacheUpdater).toBeCalled();
    });
  });

  describe('refreshCache', () => {
    it('should refresh cache', async () => {
      let d: Deferred<any>;
      marvelCache.set.mockImplementation(
        (key: string, value: Deferred<any>) => {
          expect(key).toBe(MARVEL_CHARACTERS_DEFERRED_KEY);
          d = value;

          return true;
        },
      );

      const result = {
        items: [1, 2, 3],
        size: 10,
      };

      marvelServerService.getCharacterList.mockResolvedValue(result);

      // call refresh code
      await marvelCacheService.refreshCache();

      await expect(d.promise).resolves.toEqual(result);
    });
  });

  describe('isCacheUpdated', () => {
    it('should return true if cache updated', async () => {
      marvelServerService.getCharacterListSize.mockResolvedValue(10);

      const d = new Deferred();
      d.resolve({ size: 10 });
      marvelCache.get.mockReturnValue(d);

      await expect(marvelCacheService.isCacheUpdated()).resolves.toBe(true);
    });

    it('should return false if cache updated', async () => {
      marvelServerService.getCharacterListSize.mockResolvedValue(11);

      const d = new Deferred();
      d.resolve({ size: 10 });
      marvelCache.get.mockReturnValue(d);

      await expect(marvelCacheService.isCacheUpdated()).resolves.toBe(false);
    });

    it('should return false when server connection fails', async () => {
      marvelServerService.getCharacterListSize.mockRejectedValue('failed');

      await expect(marvelCacheService.isCacheUpdated()).resolves.toBe(false);
    });
  });
});
