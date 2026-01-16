import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminClientsService } from './admin-clients.service';
import { AdminClientsController } from './admin-clients.controller';
import { AdminClientNetworksService } from './admin-client-networks.service';
import { AdminClientNetworksController } from './admin-client-networks.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminNetworksService } from './admin-networks.service';
import { AdminNetworksController } from './admin-networks.controller';
import { AdminConfigService } from './admin-config.service';
import { AdminConfigController } from './admin-config.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    AdminClientsService,
    AdminClientNetworksService,
    AdminUsersService,
    AdminNetworksService,
    AdminConfigService,
  ],
  controllers: [
    AdminClientsController,
    AdminClientNetworksController,
    AdminUsersController,
    AdminNetworksController,
    AdminConfigController,
  ],
  exports: [
    AdminClientsService,
    AdminClientNetworksService,
    AdminUsersService,
    AdminNetworksService,
    AdminConfigService,
  ],
})
export class AdminModule {}
