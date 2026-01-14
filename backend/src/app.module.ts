import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NetworksModule } from './networks/networks.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { PricingModule } from './pricing/pricing.module';

@Module({
  imports: [NetworksModule, ClientsModule, ProductsModule, PricingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
