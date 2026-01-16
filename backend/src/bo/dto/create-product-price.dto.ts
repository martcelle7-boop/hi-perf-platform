import { IsInt, IsNotEmpty, IsDecimal } from 'class-validator';

export class CreateProductPriceDto {
  @IsInt()
  @IsNotEmpty()
  networkId: number;

  @IsDecimal()
  @IsNotEmpty()
  amount: string;
}
