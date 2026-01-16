import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AdminClientNetworksService } from './admin-client-networks.service';
import { AssignNetworkDto } from './dto/assign-network.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ClientNetwork } from '@prisma/client';

@Controller('admin/clients/:clientId/networks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminClientNetworksController {
  constructor(
    private readonly adminClientNetworksService: AdminClientNetworksService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async assignNetwork(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() assignNetworkDto: AssignNetworkDto,
  ): Promise<ClientNetwork> {
    return this.adminClientNetworksService.assignNetworkToClient(
      clientId,
      assignNetworkDto,
    );
  }

  @Get()
  async getNetworks(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<ClientNetwork[]> {
    return this.adminClientNetworksService.getClientNetworks(clientId);
  }

  @Delete(':networkId')
  @HttpCode(HttpStatus.OK)
  async removeNetwork(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Param('networkId', ParseIntPipe) networkId: number,
  ): Promise<ClientNetwork> {
    return this.adminClientNetworksService.removeNetworkFromClient(
      clientId,
      networkId,
    );
  }
}
