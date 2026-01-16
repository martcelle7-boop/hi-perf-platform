import { IsString, IsOptional, MinLength, IsInt } from 'class-validator';

export class UpdateNetworkDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  code?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;

  @IsInt()
  @IsOptional()
  parentNetworkId?: number;
}
