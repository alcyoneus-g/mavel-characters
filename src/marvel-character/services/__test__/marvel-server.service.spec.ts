import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/common';
import { MarvelServerService } from '../marvel-server.service';
import { mockNodeCache } from '../../__test__/common';
import { of } from 'rxjs';

const BASE_URL = 'https://gateway.marvel.com';
const PUBLIC_KEY = 'publicKey';
const PRIVATE_KEY = 'privateKey';
const HASH = '30fa6ebbbb7f7b174caebc7bcf4b21db';

const makeCharactersResponseData = (limit: number, offset: number) => ({
  code: 200,
  status: 'Ok',
  copyright: '© 2021 MARVEL',
  data: {
    offset: offset,
    limit: limit,
    total: 200,
    count: limit,
    results: Array.from(Array(limit), (_, idx) => ({
      id: offset * 1000 + idx,
      name: `${offset * 1000 + idx} Man`,
      description: `${offset * 1000 + idx} Man that is powerful`,
    })),
  },
});

describe('MarvelServerService', () => {
  let marvelServerService: MarvelServerService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: MarvelServerService,
          useFactory: (httpService: HttpService) => {
            return new MarvelServerService(
              httpService,
              BASE_URL,
              PUBLIC_KEY,
              PRIVATE_KEY,
            );
          },
          inject: [HttpService],
        },
        {
          provide: HttpService,
          useFactory: mockNodeCache,
        },
      ],
    }).compile();

    marvelServerService = module.get(MarvelServerService);
    httpService = module.get(HttpService);
  });

  describe('getCharacterList', () => {
    it('should get list of all character ids', async () => {
      marvelServerService.getCharacterListSize = jest
        .fn()
        .mockResolvedValue(200);

      marvelServerService.getCharacterListPage = jest
        .fn()
        .mockImplementation((page: number) => {
          return Promise.resolve(
            makeCharactersResponseData(100, (page - 1) * 100).data,
          );
        });

      await expect(marvelServerService.getCharacterList()).resolves.toEqual({
        size: 200,
        items: [1, 2].flatMap((p) =>
          Array.from(Array(100), (_, idx) => (p - 1) * 100000 + idx),
        ),
      });
    });
  });

  describe('getCharacterListPage', () => {
    it('should call server with correct url', async () => {
      jest
        .useFakeTimers('modern')
        .setSystemTime(new Date('2020-01-01').getTime());

      const data = makeCharactersResponseData(100, 0);
      httpService.get.mockReturnValue(of({ data } as any));

      await expect(
        marvelServerService.getCharacterListPage(1),
      ).resolves.toEqual(data.data);

      expect(httpService.get).toBeCalledWith(
        'https://gateway.marvel.com/v1/public/characters?limit=100&offset=0' +
          `&apikey=${PUBLIC_KEY}` +
          `&ts=${Date.now()}` +
          `&hash=${HASH}`,
      );
    });

    it('should get total size', async () => {
      jest
        .useFakeTimers('modern')
        .setSystemTime(new Date('2020-01-01').getTime());

      const data = { data: { total: 210 } };
      httpService.get.mockReturnValue(of({ data } as any));

      await expect(marvelServerService.getCharacterListSize()).resolves.toEqual(
        210,
      );

      expect(httpService.get).toBeCalledWith(
        'https://gateway.marvel.com/v1/public/characters?limit=1&offset=0' +
          `&apikey=${PUBLIC_KEY}` +
          `&ts=${Date.now()}` +
          `&hash=${HASH}`,
      );
    });

    it('should get single character', async () => {
      const data = makeCharactersResponseData(1, 0);
      httpService.get.mockReturnValue(of({ data } as any));

      await expect(marvelServerService.getCharacter(0)).resolves.toEqual({
        id: 0,
        name: '0 Man',
        description: '0 Man that is powerful',
      });

      expect(httpService.get).toBeCalledWith(
        `https://gateway.marvel.com/v1/public/characters/0` +
          `?apikey=${PUBLIC_KEY}` +
          `&ts=${Date.now()}` +
          `&hash=${HASH}`,
      );
    });
  });
});
