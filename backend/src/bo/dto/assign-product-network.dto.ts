import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignProductNetworkDto {
  @IsInt()
  @IsNotEmpty()
  networkId: number;
}
