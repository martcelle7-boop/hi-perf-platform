import {
  Controller,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BoProductPricesService } from './bo-product-prices.service';
import { UpdateProductPriceDto } from './dto/update-product-price.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ProductPrice } from '@prisma/client';

@Controller('bo/products/:productId/prices/standalone')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('BO', 'ADMIN')
export class BoProductPricesStandaloneController {
  constructor(private readonly boProductPricesService: BoProductPricesService) {}

  @Patch(':networkId')
  async updatePrice(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('networkId', ParseIntPipe) networkId: number,
    @Body() updateProductPriceDto: UpdateProductPriceDto,
  ): Promise<ProductPrice> {
    return this.boProductPricesService.updatePrice(
      productId,
      networkId,
      updateProductPriceDto,
    );
  }

  @Delete(':networkId')
  @HttpCode(HttpStatus.OK)
  async deletePrice(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('networkId', ParseIntPipe) networkId: number,
  ): Promise<ProductPrice> {
    return this.boProductPricesService.deletePrice(productId, networkId);
  }
}
