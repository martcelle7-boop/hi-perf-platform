import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { SetProductPriceDto } from './dto/set-product-price.dto';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  // === PRICE MANAGEMENT ===

  @Put('products/:productId/networks/:networkId')
  @HttpCode(HttpStatus.OK)
  async setPrice(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('networkId', ParseIntPipe) networkId: number,
    @Body(new ValidationPipe()) setProductPriceDto: SetProductPriceDto,
  ) {
    return this.pricingService.setPrice(productId, networkId, setProductPriceDto);
  }

  @Get('products/:productId/networks/:networkId')
  async getExplicitPrice(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('networkId', ParseIntPipe) networkId: number,
  ) {
    return this.pricingService.getExplicitPrice(productId, networkId);
  }

  @Get('products/:productId/networks/:networkId/effective')
  async getEffectivePrice(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('networkId', ParseIntPipe) networkId: number,
  ) {
    return this.pricingService.getEffectivePrice(productId, networkId);
  }

  // === CONVENIENCE ENDPOINTS ===

  @Get('networks/:networkId/products')
  async listProductsWithPricesInNetwork(
    @Param('networkId', ParseIntPipe) networkId: number,
  ) {
    return this.pricingService.listProductsWithPricesInNetwork(networkId);
  }
}
