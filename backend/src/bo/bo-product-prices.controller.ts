import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BoProductPricesService } from './bo-product-prices.service';
import { CreateProductPriceDto } from './dto/create-product-price.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ProductPrice } from '@prisma/client';

@Controller('bo/products/:productId/prices')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('BO', 'ADMIN')
export class BoProductPricesController {
  constructor(private readonly boProductPricesService: BoProductPricesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPrice(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() createProductPriceDto: CreateProductPriceDto,
  ): Promise<ProductPrice> {
    return this.boProductPricesService.createPrice(
      productId,
      createProductPriceDto,
    );
  }

  @Get()
  async getPrices(
    @Param('productId', ParseIntPipe) productId: number,
  ): Promise<ProductPrice[]> {
    return this.boProductPricesService.getPricesForProduct(productId);
  }

  @Get('network/:networkId')
  async getPrice(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('networkId', ParseIntPipe) networkId: number,
  ): Promise<ProductPrice> {
    return this.boProductPricesService.getPrice(productId, networkId);
  }
}
