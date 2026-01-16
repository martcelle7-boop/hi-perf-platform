import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignNetworkDto {
  @IsInt()
  @IsNotEmpty()
  networkId: number;
}
