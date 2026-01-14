import { IsString, IsNumberString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateProductPriceDto {
  @IsOptional()
  @IsNumberString()
  amount?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}
