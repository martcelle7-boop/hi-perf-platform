import { IsDecimal, IsOptional } from 'class-validator';

export class UpdateProductPriceDto {
  @IsDecimal()
  @IsOptional()
  amount?: string;
}
