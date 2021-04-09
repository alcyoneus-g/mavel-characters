import { HttpService } from '@nestjs/common';
import NodeCache from 'node-cache';
import { MarvelCacheService } from '../services/marvel-cache.service';
import { MarvelServerService } from '../services/marvel-server.service';

export const mockNodeCache = (): Partial<NodeCache> => ({
  get: jest.fn(),
  set: jest.fn(),
});

export const mockHttpService = (): Partial<HttpService> => ({
  get: jest.fn(),
});

export const mockMarvelServerService = (): Partial<MarvelServerService> => ({
  getCharacterList: jest.fn(),
  getCharacterListPage: jest.fn(),
  getCharacter: jest.fn(),
  getCharacterListSize: jest.fn(),
});

export const mockMarvelCacheService = (): Partial<MarvelCacheService> => ({
  ensureCacheInitialized: jest.fn(),
});
