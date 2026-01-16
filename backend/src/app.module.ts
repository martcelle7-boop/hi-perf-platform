import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NetworksModule } from './networks/networks.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { PricingModule } from './pricing/pricing.module';
import { QuotationsModule } from './quotations/quotations.module';

@Module({
  imports: [AuthModule, NetworksModule, ClientsModule, ProductsModule, PricingModule, QuotationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
