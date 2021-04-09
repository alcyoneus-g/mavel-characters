import { Test } from '@nestjs/testing';
import NodeCache from 'node-cache';
import {
  mockMarvelCacheService,
  mockMarvelServerService,
  mockNodeCache,
} from '../../__test__/common';
import { MarvelCacheService } from '../../services/marvel-cache.service';
import { MarvelServerService } from '../../services/marvel-server.service';
import { MarvelCharacterProvider } from '../marvel-character.provider';
import { MARVEL_CACHE } from '../../constants';
import { Deferred } from 'ts-deferred';

describe('MarvelServerService', () => {
  let marvelCharacterProvider: MarvelCharacterProvider;
  let marvelCache: jest.Mocked<NodeCache>;
  let marvelCacheService: jest.Mocked<MarvelCacheService>;
  let marvelServerService: jest.Mocked<MarvelServerService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MarvelCharacterProvider,
        {
          provide: MARVEL_CACHE,
          useFactory: mockNodeCache,
        },
        {
          provide: MarvelCacheService,
          useFactory: mockMarvelCacheService,
        },
        {
          provide: MarvelServerService,
          useFactory: mockMarvelServerService,
        },
      ],
    }).compile();

    marvelCharacterProvider = module.get(MarvelCharacterProvider);
    marvelCache = module.get(MARVEL_CACHE);
    marvelCacheService = module.get(MarvelCacheService);
    marvelServerService = module.get(MarvelServerService);
  });

  describe('getCharacterList', () => {
    it('should get list of all character ids', async () => {
      const d = new Deferred();
      d.resolve({ items: [1, 2, 3] });
      marvelCache.get.mockReturnValue(d);

      await expect(
        marvelCharacterProvider.getCharacterList(),
      ).resolves.toEqual([1, 2, 3]);

      expect(marvelCacheService.ensureCacheInitialized).toBeCalled();
    });
  });

  describe('getCharacter', () => {
    it('should get single character', async () => {
      const value = {
        id: 0,
        name: '0 Man',
        description: '0 Man that is powerful',
      };

      marvelServerService.getCharacter.mockResolvedValue(value);

      await expect(marvelCharacterProvider.getCharacter(1)).resolves.toEqual(
        value,
      );

      expect(marvelServerService.getCharacter).toBeCalledWith(1);
    });
  });
});
