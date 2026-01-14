import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  NotFoundException,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { Client, User } from '@prisma/client';

class CreateClientDto {
  name: string;
}

class UpdateClientDto {
  name?: string;
}

class AssignUserDto {
  userId: number;
}

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // === CLIENT CRUD ===

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClientDto: CreateClientDto): Promise<Client> {
    return this.clientsService.create(createClientDto);
  }

  @Get()
  async findAll(): Promise<Client[]> {
    return this.clientsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Client> {
    const client = await this.clientsService.findOne(id);
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ): Promise<Client> {
    try {
      return await this.clientsService.update(id, updateClientDto);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.clientsService.remove(id);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }
      throw error;
    }
  }

  // === CLIENT NETWORK MEMBERSHIP ===

  @Post(':id/networks/:networkId')
  @HttpCode(HttpStatus.CREATED)
  async addNetwork(
    @Param('id', ParseIntPipe) clientId: number,
    @Param('networkId', ParseIntPipe) networkId: number,
  ) {
    return this.clientsService.addNetwork(clientId, networkId);
  }

  @Delete(':id/networks/:networkId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeNetwork(
    @Param('id', ParseIntPipe) clientId: number,
    @Param('networkId', ParseIntPipe) networkId: number,
  ): Promise<void> {
    return this.clientsService.removeNetwork(clientId, networkId);
  }

  @Get(':id/networks')
  async getNetworks(
    @Param('id', ParseIntPipe) clientId: number,
  ) {
    return this.clientsService.getNetworks(clientId);
  }

  // === USER ASSIGNMENT ===

  @Post(':id/users/assign')
  async assignUser(
    @Param('id', ParseIntPipe) clientId: number,
    @Body() assignUserDto: AssignUserDto,
  ): Promise<User> {
    return this.clientsService.assignUser(clientId, assignUserDto.userId);
  }

  @Post(':id/users/:userId/unassign')
  @HttpCode(HttpStatus.OK)
  async unassignUser(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<User> {
    return this.clientsService.unassignUser(userId);
  }

  @Get(':id/users')
  async getUsers(
    @Param('id', ParseIntPipe) clientId: number,
  ): Promise<User[]> {
    return this.clientsService.getUsers(clientId);
  }
}
