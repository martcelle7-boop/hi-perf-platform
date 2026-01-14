import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Network, NetworkType } from '@prisma/client';

@Injectable()
export class NetworksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    code: string;
    name: string;
    type?: NetworkType;
    parentNetworkId?: number;
  }): Promise<Network> {
    return this.prisma.network.create({
      data,
      include: {
        parentNetwork: true,
        childNetworks: true,
      },
    });
  }

  async findAll(): Promise<Network[]> {
    return this.prisma.network.findMany({
      include: {
        parentNetwork: true,
        childNetworks: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number): Promise<Network | null> {
    return this.prisma.network.findUnique({
      where: { id },
      include: {
        parentNetwork: true,
        childNetworks: true,
        clientNetworks: true,
      },
    });
  }

  async findByCode(code: string): Promise<Network | null> {
    return this.prisma.network.findUnique({
      where: { code },
      include: {
        parentNetwork: true,
        childNetworks: true,
      },
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      type?: NetworkType;
      parentNetworkId?: number | null;
    },
  ): Promise<Network> {
    return this.prisma.network.update({
      where: { id },
      data,
      include: {
        parentNetwork: true,
        childNetworks: true,
      },
    });
  }

  async remove(id: number): Promise<Network> {
    return this.prisma.network.delete({
      where: { id },
    });
  }

  async findChildren(parentNetworkId: number): Promise<Network[]> {
    return this.prisma.network.findMany({
      where: { parentNetworkId },
      include: {
        parentNetwork: true,
        childNetworks: true,
      },
    });
  }
}
