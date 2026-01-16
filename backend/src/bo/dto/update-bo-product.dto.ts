import { IsString, IsOptional, MinLength, IsBoolean, IsEnum, IsDecimal } from 'class-validator';

enum ProductType {
  GENERIC = 'GENERIC',
  NORMAL = 'NORMAL',
  PARTNER = 'PARTNER',
}

export class UpdateBoProductDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  code?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @IsEnum(ProductType)
  @IsOptional()
  type?: string;

  @IsDecimal()
  @IsOptional()
  publicPrice?: string;

  @IsString()
  @IsOptional()
  priceDescription?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
