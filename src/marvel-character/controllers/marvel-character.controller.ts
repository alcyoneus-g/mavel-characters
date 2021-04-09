import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOkResponse, ApiParam } from '@nestjs/swagger';
import { MarvelCharacterDto } from '../dtos/marvel-character.dto';
import { MarvelCharacterProvider } from '../providers/marvel-character.provider';

@Controller()
export class MarvelCharacterController {
  constructor(
    private readonly marvelCharacterProvider: MarvelCharacterProvider,
  ) {}

  @ApiOkResponse({
    type: [String],
  })
  @Get('characters')
  async getCharacters() {
    return await this.marvelCharacterProvider.getCharacterList();
  }

  @ApiOkResponse({
    type: MarvelCharacterDto,
  })
  @ApiParam({ name: 'id', description: 'Character ID' })
  @Get('characters/:id')
  async getCharacter(@Param('id', ParseIntPipe) id: number) {
    return await this.marvelCharacterProvider.getCharacter(id);
  }
}
