import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export class CreateRequestDto {
  @IsString()
  @MinLength(1, { message: 'Please enter a request name.' })
  name!: string;

  @IsEnum(HttpMethod, {
    message: 'Please choose a valid HTTP method.',
  })
  method!: HttpMethod;

  @IsUrl({}, { message: 'Please enter a valid request URL.' })
  url!: string;

  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @IsOptional()
  body?: any;
}