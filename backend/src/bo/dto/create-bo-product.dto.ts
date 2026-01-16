import { IsString, IsNotEmpty, MinLength, IsEnum, IsDecimal, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

enum ProductType {
  GENERIC = 'GENERIC',
  NORMAL = 'NORMAL',
  PARTNER = 'PARTNER',
}

export class CreateBoProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsEnum(ProductType)
  @IsNotEmpty()
  type: string;

  @IsDecimal()
  @IsOptional()
  publicPrice?: string;

  @IsString()
  @IsOptional()
  priceDescription?: string;
}
