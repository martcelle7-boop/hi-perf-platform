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
import { NetworksService } from './networks.service';
import { Network, NetworkType } from '@prisma/client';

class CreateNetworkDto {
  code: string;
  name: string;
  type?: NetworkType;
  parentNetworkId?: number;
}

class UpdateNetworkDto {
  name?: string;
  type?: NetworkType;
  parentNetworkId?: number | null;
}

@Controller('networks')
export class NetworksController {
  constructor(private readonly networksService: NetworksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNetworkDto: CreateNetworkDto): Promise<Network> {
    return this.networksService.create(createNetworkDto);
  }

  @Get()
  async findAll(): Promise<Network[]> {
    return this.networksService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Network> {
    const network = await this.networksService.findOne(id);
    if (!network) {
      throw new NotFoundException(`Network with ID ${id} not found`);
    }
    return network;
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string): Promise<Network> {
    const network = await this.networksService.findByCode(code);
    if (!network) {
      throw new NotFoundException(`Network with code ${code} not found`);
    }
    return network;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNetworkDto: UpdateNetworkDto,
  ): Promise<Network> {
    try {
      return await this.networksService.update(id, updateNetworkDto);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Network with ID ${id} not found`);
      }
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      await this.networksService.remove(id);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Network with ID ${id} not found`);
      }
      throw error;
    }
  }

  @Get(':id/children')
  async findChildren(
    @Param('id', ParseIntPipe) parentNetworkId: number,
  ): Promise<Network[]> {
    return this.networksService.findChildren(parentNetworkId);
  }
}
