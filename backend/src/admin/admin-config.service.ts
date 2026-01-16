import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface Config {
  allowMultiNetworkCart: boolean;
}

@Injectable()
export class AdminConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(): Promise<Config> {
    try {
      // For MVP, store config in-memory or in a dedicated table
      // This is a placeholder implementation
      return {
        allowMultiNetworkCart: false,
      };
    } catch (error) {
      throw new BadRequestException('Failed to fetch config');
    }
  }

  async updateConfig(updates: Partial<Config>): Promise<Config> {
    try {
      // For MVP, this would update a config table
      // This is a placeholder implementation
      const config: Config = {
        allowMultiNetworkCart: updates.allowMultiNetworkCart ?? false,
      };

      return config;
    } catch (error) {
      throw new BadRequestException('Failed to update config');
    }
  }
}
