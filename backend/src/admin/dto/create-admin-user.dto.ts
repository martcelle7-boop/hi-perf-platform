import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum, IsOptional, IsInt } from 'class-validator';

enum UserRole {
  ADMIN = 'ADMIN',
  BO = 'BO',
  USER = 'USER',
}

export class CreateAdminUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: string;

  @IsInt()
  @IsOptional()
  clientId?: number;
}
