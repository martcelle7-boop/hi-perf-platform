import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateConfigDto {
  @IsBoolean()
  @IsOptional()
  allowMultiNetworkCart?: boolean;
}
