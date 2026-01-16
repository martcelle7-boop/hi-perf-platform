import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NetworksModule } from './networks/networks.module';
import { ClientsModule } from './clients/clients.module';
import { ProductsModule } from './products/products.module';
import { PricingModule } from './pricing/pricing.module';
import { QuotationsModule } from './quotations/quotations.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [AuthModule, NetworksModule, ClientsModule, ProductsModule, PricingModule, QuotationsModule, CatalogModule, OrdersModule, PaymentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
