import { HttpService, Injectable, NotFoundException } from '@nestjs/common';
import { URL } from 'url';
import { pick } from 'lodash';
import { IdListDto } from '../dtos/id-list.dto';
import { FailedToFetchError } from '../exceptions/failed-to-fetch.error';
import { MarvelCharacterDto } from '../dtos/marvel-character.dto';
import { makeHash } from '../utils/marvel-hash.utils';
import sleep from 'sleep-promise';

@Injectable()
export class MarvelServerService {
  constructor(
    private readonly httpService: HttpService,
    private readonly baseUrl: string,
    private readonly publicKey: string,
    private readonly privateKey: string,
  ) {}

  async getCharacterList(): Promise<IdListDto> {
    // get all data
    const size = await this.getCharacterListSize();

    // calculate pages
    const pagesCount = Math.ceil(size / 100);

    // create promise array of all pages
    const pageContents = await Promise.all(
      Array.from(Array(pagesCount), (_, idx) =>
        this.getCharacterListPage(idx + 1),
      ),
    );

    // concat all responses
    const items = pageContents.flatMap((pageContent) =>
      pageContent.results.map((r) => r.id),
    );

    return {
      size,
      items,
    };
  }

  async getCharacterListPage(page: number) {
    // get data from marvel's server
    const url = new URL('v1/public/characters', this.baseUrl);
    url.searchParams.set('limit', '100');
    url.searchParams.set('offset', ((page - 1) * 100).toString());
    url.searchParams.set('apikey', this.publicKey);

    const ts = Date.now();
    const hash = makeHash(ts, this.privateKey, this.publicKey);
    url.searchParams.set('ts', ts.toString());
    url.searchParams.set('hash', hash);

    while (true) {
      try {
        const {
          data: { data },
        } = await this.httpService.get(url.toString()).toPromise();

        return data;
      } catch (e) {
        // wait 2 seconds and retry
        // TODO use a better retry strategy
        await sleep(2000);
      }
    }
  }

  async getCharacterListSize(): Promise<number> {
    // get all data
    try {
      // get data from marvel's server
      const url = new URL('v1/public/characters', this.baseUrl);
      url.searchParams.set('limit', '1');
      url.searchParams.set('offset', '0');
      url.searchParams.set('apikey', this.publicKey);

      const ts = Date.now();
      const hash = makeHash(ts, this.privateKey, this.publicKey);
      url.searchParams.set('ts', ts.toString());
      url.searchParams.set('hash', hash);

      const {
        data: { data },
      } = await this.httpService.get(url.toString()).toPromise();

      // set size
      return data.total;
    } catch (e) {
      throw new FailedToFetchError();
    }
  }

  async getCharacter(id: number): Promise<MarvelCharacterDto> {
    // get all data
    try {
      const url = new URL(`v1/public/characters/${id}`, this.baseUrl);
      url.searchParams.set('apikey', this.publicKey);

      const ts = Date.now();
      const hash = makeHash(ts, this.privateKey, this.publicKey);
      url.searchParams.set('ts', ts.toString());
      url.searchParams.set('hash', hash);

      const {
        data: { data },
      } = await this.httpService.get(url.toString()).toPromise();

      return pick(data.results[0], 'id', 'name', 'description');
    } catch (e) {
      if (e.response.status === 404) {
        throw new NotFoundException();
      } else {
        throw new FailedToFetchError();
      }
    }
  }
}
