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
import { BoProductNetworksService } from './bo-product-networks.service';
import { AssignProductNetworkDto } from './dto/assign-product-network.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ProductNetwork } from '@prisma/client';

@Controller('bo/products/:productId/networks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('BO', 'ADMIN')
export class BoProductNetworksController {
  constructor(
    private readonly boProductNetworksService: BoProductNetworksService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async assignNetwork(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() assignProductNetworkDto: AssignProductNetworkDto,
  ): Promise<ProductNetwork> {
    return this.boProductNetworksService.assignProductToNetwork(
      productId,
      assignProductNetworkDto,
    );
  }

  @Get()
  async getNetworks(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductNetwork[]> {
    return this.boProductNetworksService.getProductNetworks(productId);
  }

  @Delete(':networkId')
  @HttpCode(HttpStatus.OK)
  async removeNetwork(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('networkId', ParseIntPipe) networkId: number,
  ): Promise<ProductNetwork> {
    return this.boProductNetworksService.removeProductFromNetwork(
      productId,
      networkId,
    );
  }
}
