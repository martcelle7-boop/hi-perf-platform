import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Allow access to generated model delegates (e.g. `prisma.quotation`) without
  // TypeScript errors while the generated client is present.
  // This keeps the class strongly-typed for PrismaClient methods, but permits
  // bracket/property access for generated models.
  [key: string]: any;
  constructor() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://localhost/hiperf_db';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
