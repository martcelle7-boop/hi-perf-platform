import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateClientDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  name?: string;
}
