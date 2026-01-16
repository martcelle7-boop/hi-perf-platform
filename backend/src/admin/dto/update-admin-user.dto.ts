import { IsEmail, IsString, IsOptional, MinLength, IsEnum, IsInt } from 'class-validator';

enum UserRole {
  ADMIN = 'ADMIN',
  BO = 'BO',
  USER = 'USER',
}

export class UpdateAdminUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: string;

  @IsInt()
  @IsOptional()
  clientId?: number;

  @IsString()
  @IsOptional()
  @MinLength(8)
  newPassword?: string;
}
