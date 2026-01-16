import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientNetwork } from '@prisma/client';
import { AssignNetworkDto } from './dto/assign-network.dto';

@Injectable()
export class AdminClientNetworksService {
  constructor(private readonly prisma: PrismaService) {}

  async assignNetworkToClient(
    clientId: number,
    assignNetworkDto: AssignNetworkDto,
  ): Promise<ClientNetwork> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${clientId} not found`);
      }

      const network = await this.prisma.network.findUnique({
        where: { id: assignNetworkDto.networkId },
      });

      if (!network) {
        throw new NotFoundException(
          `Network with ID ${assignNetworkDto.networkId} not found`,
        );
      }

      // Check if already assigned
      const existing = await this.prisma.clientNetwork.findUnique({
        where: {
          clientId_networkId: {
            clientId,
            networkId: assignNetworkDto.networkId,
          },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Network already assigned to this client',
        );
      }

      return await this.prisma.clientNetwork.create({
        data: {
          clientId,
          networkId: assignNetworkDto.networkId,
        },
        include: {
          network: true,
          client: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to assign network to client');
    }
  }

  async removeNetworkFromClient(
    clientId: number,
    networkId: number,
  ): Promise<ClientNetwork> {
    try {
      const clientNetwork = await this.prisma.clientNetwork.findUnique({
        where: {
          clientId_networkId: {
            clientId,
            networkId,
          },
        },
      });

      if (!clientNetwork) {
        throw new NotFoundException(
          `Client-Network assignment not found`,
        );
      }

      return await this.prisma.clientNetwork.delete({
        where: {
          clientId_networkId: {
            clientId,
            networkId,
          },
        },
        include: {
          network: true,
          client: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException(
        'Failed to remove network from client',
      );
    }
  }

  async getClientNetworks(clientId: number): Promise<ClientNetwork[]> {
    try {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        throw new NotFoundException(`Client with ID ${clientId} not found`);
      }

      return await this.prisma.clientNetwork.findMany({
        where: { clientId },
        include: {
          network: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to fetch client networks');
    }
  }
}
