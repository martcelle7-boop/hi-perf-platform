import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdminUserDto: CreateAdminUserDto): Promise<Omit<User, 'password'>> {
    try {
      // Check if user already exists
      const existing = await this.prisma.user.findUnique({
        where: { email: createAdminUserDto.email },
      });

      if (existing) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(createAdminUserDto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          email: createAdminUserDto.email,
          password: hashedPassword,
          role: createAdminUserDto.role as any,
          clientId: createAdminUserDto.clientId,
        },
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(): Promise<Omit<User, 'password'>[]> {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return users.map(({ password, ...user }) => user);
    } catch (error) {
      throw new BadRequestException('Failed to fetch users');
    }
  }

  async findOne(id: number): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch user');
    }
  }

  async update(
    id: number,
    updateAdminUserDto: UpdateAdminUserDto,
  ): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Check if email is being changed and if it's unique
      if (updateAdminUserDto.email && updateAdminUserDto.email !== user.email) {
        const existing = await this.prisma.user.findUnique({
          where: { email: updateAdminUserDto.email },
        });

        if (existing) {
          throw new ConflictException(
            'User with this email already exists',
          );
        }
      }

      const updateData: any = {};
      if (updateAdminUserDto.email) updateData.email = updateAdminUserDto.email;
      if (updateAdminUserDto.role) updateData.role = updateAdminUserDto.role as any;
      if (updateAdminUserDto.clientId !== undefined)
        updateData.clientId = updateAdminUserDto.clientId;
      if (updateAdminUserDto.newPassword) {
        updateData.password = await bcrypt.hash(updateAdminUserDto.newPassword, 10);
      }

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updateData,
      });

      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  async remove(id: number, requestingUserId: number): Promise<Omit<User, 'password'>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Prevent self-delete
      if (id === requestingUserId) {
        throw new BadRequestException('Cannot delete your own user account');
      }

      const deletedUser = await this.prisma.user.delete({
        where: { id },
      });

      const { password, ...userWithoutPassword } = deletedUser;
      return userWithoutPassword;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user');
    }
  }
}
