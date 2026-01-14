import { Module } from '@nestjs/common';
import { NetworksService } from './networks.service';
import { NetworksController } from './networks.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [NetworksController],
  providers: [NetworksService, PrismaService],
  exports: [NetworksService],
})
export class NetworksModule {}
