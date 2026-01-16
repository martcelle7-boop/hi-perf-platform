import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminModule } from '../admin/admin.module';
import { BoProductsService } from './bo-products.service';
import { BoProductsController } from './bo-products.controller';
import { BoProductNetworksService } from './bo-product-networks.service';
import { BoProductNetworksController } from './bo-product-networks.controller';
import { BoProductPricesService } from './bo-product-prices.service';
import { BoProductPricesController } from './bo-product-prices.controller';
import { BoProductPricesStandaloneController } from './bo-product-prices-standalone.controller';

@Module({
  imports: [PrismaModule, AdminModule],
  providers: [
    BoProductsService,
    BoProductNetworksService,
    BoProductPricesService,
  ],
  controllers: [
    BoProductsController,
    BoProductNetworksController,
    BoProductPricesController,
    BoProductPricesStandaloneController,
  ],
  exports: [
    BoProductsService,
    BoProductNetworksService,
    BoProductPricesService,
  ],
})
export class BoModule {}
