import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Client, User } from '@prisma/client';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  // === CLIENT CRUD ===

  async create(data: { name: string }): Promise<Client> {
    return this.prisma.client.create({
      data,
      include: {
        users: true,
        clientNetworks: {
          include: {
            network: true,
          },
        },
      },
    });
  }

  async findAll(): Promise<Client[]> {
    return this.prisma.client.findMany({
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
  }

  async findOne(id: number): Promise<Client | null> {
    return this.prisma.client.findUnique({
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
  }

  async update(id: number, data: { name?: string }): Promise<Client> {
    return this.prisma.client.update({
      where: { id },
      data,
      include: {
        users: true,
        clientNetworks: {
          include: {
            network: true,
          },
        },
      },
    });
  }

  async remove(id: number): Promise<Client> {
    // Load client with users and networks
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        users: true,
        clientNetworks: true,
      },
    });

    // Check if client exists
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }

    // Check if client has users
    if (client.users.length > 0) {
      throw new ConflictException(
        `Cannot delete client with ID ${id}: it has ${client.users.length} assigned user(s)`,
      );
    }

    // Check if client has networks
    if (client.clientNetworks.length > 0) {
      throw new ConflictException(
        `Cannot delete client with ID ${id}: it has ${client.clientNetworks.length} assigned network(s)`,
      );
    }

    return this.prisma.client.delete({
      where: { id },
    });
  }

  // === CLIENT NETWORK MEMBERSHIP ===

  async addNetwork(clientId: number, networkId: number) {
    // Verify client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Verify network exists
    const network = await this.prisma.network.findUnique({
      where: { id: networkId },
    });
    if (!network) {
      throw new NotFoundException(`Network with ID ${networkId} not found`);
    }

    // Check if ClientNetwork relation already exists
    const existingClientNetwork = await this.prisma.clientNetwork.findUnique({
      where: {
        clientId_networkId: {
          clientId,
          networkId,
        },
      },
    });

    if (existingClientNetwork) {
      throw new ConflictException(
        `Client ${clientId} is already assigned to Network ${networkId}`,
      );
    }

    // Create the ClientNetwork relation
    return this.prisma.clientNetwork.create({
      data: {
        clientId,
        networkId,
      },
      include: {
        client: true,
        network: true,
      },
    });
  }

  async removeNetwork(clientId: number, networkId: number): Promise<void> {
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
        `Client ${clientId} is not assigned to Network ${networkId}`,
      );
    }

    await this.prisma.clientNetwork.delete({
      where: {
        clientId_networkId: {
          clientId,
          networkId,
        },
      },
    });
  }

  async getNetworks(clientId: number) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        clientNetworks: {
          include: {
            network: true,
          },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return client.clientNetworks.map((cn) => cn.network);
  }

  // === USER ASSIGNMENT ===

  async assignUser(clientId: number, userId: number): Promise<User> {
    // Verify client exists
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user is already assigned to a different client
    if (user.clientId && user.clientId !== clientId) {
      throw new ConflictException(
        `User ${userId} is already assigned to Client ${user.clientId}. Unassign first before reassigning.`,
      );
    }

    // Assign user to client (or keep existing assignment if already assigned to same client)
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        clientId,
      },
    });
  }

  async unassignUser(userId: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (!user.clientId) {
      throw new BadRequestException(`User ${userId} is not assigned to any client`);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        clientId: null,
      },
    });
  }

  async getUsers(clientId: number): Promise<User[]> {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: {
        users: true,
      },
    });

    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }

    return client.users;
  }
}
