import { ApiProperty } from '@nestjs/swagger';

export class MarvelCharacterDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;
}
