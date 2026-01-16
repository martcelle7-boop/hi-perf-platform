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
  UseGuards,
} from '@nestjs/common';
import { AdminNetworksService } from './admin-networks.service';
import { CreateNetworkDto } from './dto/create-network.dto';
import { UpdateNetworkDto } from './dto/update-network.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Network } from '@prisma/client';

@Controller('admin/networks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminNetworksController {
  constructor(private readonly adminNetworksService: AdminNetworksService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNetworkDto: CreateNetworkDto): Promise<Network> {
    return this.adminNetworksService.create(createNetworkDto);
  }

  @Get()
  async findAll(): Promise<Network[]> {
    return this.adminNetworksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Network> {
    return this.adminNetworksService.findOne(id);
  }

  @Get(':id/hierarchy')
  async getHierarchy(@Param('id', ParseIntPipe) id: number): Promise<Network[]> {
    return this.adminNetworksService.getNetworkHierarchy(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNetworkDto: UpdateNetworkDto,
  ): Promise<Network> {
    return this.adminNetworksService.update(id, updateNetworkDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Network> {
    return this.adminNetworksService.remove(id);
  }
}
