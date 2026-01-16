import { Module } from '@nestjs/common';
import { QuotationsController } from './quotations.controller';
import { QuotationsService } from './quotations.service';
import { PricingModule } from '../pricing/pricing.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [PricingModule, PrismaModule, AuthModule],
  controllers: [QuotationsController],
  providers: [QuotationsService, JwtAuthGuard, RolesGuard, Reflector],
  exports: [QuotationsService],
})
export class QuotationsModule {}
