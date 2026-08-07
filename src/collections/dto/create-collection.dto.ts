import { IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCollectionDto {
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty({ message: 'Please enter a collection name.' })
  name!: string;
}
