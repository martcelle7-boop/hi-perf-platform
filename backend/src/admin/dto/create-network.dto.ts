import { IsString, IsNotEmpty, MinLength, IsOptional, IsInt } from 'class-validator';

export class CreateNetworkDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  name: string;

  @IsInt()
  @IsOptional()
  parentNetworkId?: number;
}
