import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client } from '@prisma/client';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class AdminClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto): Promise<Client> {
    try {
      return await this.prisma.client.create({
        data: {
          name: createClientDto.name,
        },
        include: {
          users: true,
          clientNetworks: {
            include: {
              network: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create client');
    }
  }

  async findAll(): Promise<Client[]> {
    try {
      return await this.prisma.client.findMany({
        include: {
          users: true,
          clientNetworks: {
            include: {
              network: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch clients');
    }
  }

  async findOne(id: number): Promise<Client> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id },
        include: {
          users: true,
          clientNetworks: {
            include: {
              network: true,
            },
          },
        },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      return client;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch client');
    }
  }

  async update(id: number, updateClientDto: UpdateClientDto): Promise<Client> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      return await this.prisma.client.update({
        where: { id },
        data: {
          name: updateClientDto.name,
        },
        include: {
          users: true,
          clientNetworks: {
            include: {
              network: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to update client');
    }
  }

  async remove(id: number): Promise<Client> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      return await this.prisma.client.delete({
        where: { id },
        include: {
          users: true,
          clientNetworks: {
            include: {
              network: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to delete client');
    }
  }
}
