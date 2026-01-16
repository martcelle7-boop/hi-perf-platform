import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Network } from '@prisma/client';
import { CreateNetworkDto } from './dto/create-network.dto';
import { UpdateNetworkDto } from './dto/update-network.dto';

@Injectable()
export class AdminNetworksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createNetworkDto: CreateNetworkDto): Promise<Network> {
    try {
      // Check if code is unique
      const existing = await this.prisma.network.findUnique({
        where: { code: createNetworkDto.code },
      });

      if (existing) {
        throw new ConflictException('Network code already exists');
      }

      // Validate parent network exists if provided
      if (createNetworkDto.parentNetworkId) {
        const parentNetwork = await this.prisma.network.findUnique({
          where: { id: createNetworkDto.parentNetworkId },
        });

        if (!parentNetwork) {
          throw new NotFoundException(
            `Parent network with ID ${createNetworkDto.parentNetworkId} not found`,
          );
        }
      }

      return await this.prisma.network.create({
        data: {
          code: createNetworkDto.code,
          name: createNetworkDto.name,
          parentNetworkId: createNetworkDto.parentNetworkId,
        },
        include: {
          parentNetwork: true,
          childNetworks: true,
        },
      });
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to create network');
    }
  }

  async findAll(): Promise<Network[]> {
    try {
      return await this.prisma.network.findMany({
        include: {
          parentNetwork: true,
          childNetworks: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch networks');
    }
  }

  async findOne(id: number): Promise<Network> {
    try {
      const network = await this.prisma.network.findUnique({
        where: { id },
        include: {
          parentNetwork: true,
          childNetworks: true,
        },
      });

      if (!network) {
        throw new NotFoundException(`Network with ID ${id} not found`);
      }

      return network;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch network');
    }
  }

  async update(
    id: number,
    updateNetworkDto: UpdateNetworkDto,
  ): Promise<Network> {
    try {
      const network = await this.prisma.network.findUnique({
        where: { id },
      });

      if (!network) {
        throw new NotFoundException(`Network with ID ${id} not found`);
      }

      // Check if code is being changed and is unique
      if (updateNetworkDto.code && updateNetworkDto.code !== network.code) {
        const existing = await this.prisma.network.findUnique({
          where: { code: updateNetworkDto.code },
        });

        if (existing) {
          throw new ConflictException('Network code already exists');
        }
      }

      // Validate parent network exists if provided
      if (updateNetworkDto.parentNetworkId) {
        const parentNetwork = await this.prisma.network.findUnique({
          where: { id: updateNetworkDto.parentNetworkId },
        });

        if (!parentNetwork) {
          throw new NotFoundException(
            `Parent network with ID ${updateNetworkDto.parentNetworkId} not found`,
          );
        }
      }

      return await this.prisma.network.update({
        where: { id },
        data: {
          code: updateNetworkDto.code,
          name: updateNetworkDto.name,
          parentNetworkId: updateNetworkDto.parentNetworkId,
        },
        include: {
          parentNetwork: true,
          childNetworks: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update network');
    }
  }

  async remove(id: number): Promise<Network> {
    try {
      const network = await this.prisma.network.findUnique({
        where: { id },
      });

      if (!network) {
        throw new NotFoundException(`Network with ID ${id} not found`);
      }

      return await this.prisma.network.delete({
        where: { id },
        include: {
          parentNetwork: true,
          childNetworks: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to delete network');
    }
  }

  /**
   * Get hierarchy path from network to root (for pricing inheritance)
   */
  async getNetworkHierarchy(id: number): Promise<Network[]> {
    try {
      const path: Network[] = [];
      let current = await this.prisma.network.findUnique({
        where: { id },
      });

      if (!current) {
        throw new NotFoundException(`Network with ID ${id} not found`);
      }

      while (current) {
        path.push(current);
        if (current.parentNetworkId) {
          current = await this.prisma.network.findUnique({
            where: { id: current.parentNetworkId },
          });
        } else {
          break;
        }
      }

      return path;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch network hierarchy');
    }
  }
}
