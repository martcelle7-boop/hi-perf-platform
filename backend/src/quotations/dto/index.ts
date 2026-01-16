import { IsInt, IsPositive, IsEnum, IsOptional } from 'class-validator';

export class CreateQuotationItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number;
}

export class UpdateQuotationItemDto {
  @IsInt()
  @IsPositive()
  quantity: number;
}

export class UpdateQuotationStatusDto {
  @IsEnum(['SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'])
  status: 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}

