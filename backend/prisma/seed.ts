import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Delete existing data in order (respecting foreign keys)
  // Note: ProductPrice table doesn't exist in current migration
  await prisma.productNetwork.deleteMany();
  await prisma.clientNetwork.deleteMany();
  await prisma.product.deleteMany();
  await prisma.network.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();
  console.log('✓ Cleared existing data');

  // Hash passwords
  const adminPassword = await bcrypt.hash('password123', 10);
  const boPassword = await bcrypt.hash('password123', 10);
  const userPassword = await bcrypt.hash('password123', 10);

  // Create networks
  const networkMain = await prisma.network.create({
    data: {
      code: 'NET-MAIN',
      name: 'Main Network',
      type: 'NORMAL',
    },
  });
  console.log('✓ Created Main Network:', networkMain.code);

  const networkPartner = await prisma.network.create({
    data: {
      code: 'NET-PARTNER',
      name: 'Partner Network',
      type: 'PARTNER',
    },
  });
  console.log('✓ Created Partner Network:', networkPartner.code);

  // Create client
  const client = await prisma.client.create({
    data: {
      name: 'Tech Company',
    },
  });
  console.log('✓ Created Client:', client.name);

  // Link client to networks
  await prisma.clientNetwork.create({
    data: {
      clientId: client.id,
      networkId: networkMain.id,
    },
  });
  await prisma.clientNetwork.create({
    data: {
      clientId: client.id,
      networkId: networkPartner.id,
    },
  });
  console.log('✓ Linked client to networks');

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✓ Created ADMIN user:', admin.email);

  const bo = await prisma.user.create({
    data: {
      email: 'bo@test.com',
      password: boPassword,
      role: 'BO',
      clientId: client.id,
    },
  });
  console.log('✓ Created BO user:', bo.email);

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@test.com',
      password: userPassword,
      role: 'USER',
      clientId: client.id,
    },
  });
  console.log('✓ Created USER user:', regularUser.email);

  // Create products
  const products = [
    {
      code: 'LAPTOP-001',
      name: 'Pro Laptop 15"',
      description: 'High-performance laptop with 16GB RAM and 512GB SSD. Perfect for professionals.',
    },
    {
      code: 'MOUSE-001',
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking. 2.4GHz wireless connection.',
    },
    {
      code: 'KEYBOARD-001',
      name: 'Mechanical Keyboard',
      description: 'Mechanical gaming keyboard with RGB lighting and cherry MX switches.',
    },
    {
      code: 'MONITOR-001',
      name: '4K Monitor 27"',
      description: '4K Ultra HD monitor with 100% DCI-P3 color gamut. 60Hz refresh rate.',
    },
    {
      code: 'HEADSET-001',
      name: 'Wireless Headset',
      description: 'Noise-cancelling wireless headset with 30-hour battery life.',
    },
  ];

  const createdProducts: Array<{ id: number; code: string; name: string; description: string | null; isActive: boolean; createdAt: Date; updatedAt: Date }> = [];
  for (const productData of products) {
    const product = await prisma.product.create({
      data: {
        code: productData.code,
        name: productData.name,
        description: productData.description,
        isActive: true,
      },
    });
    createdProducts.push(product);
    console.log('✓ Created product:', product.name);
  }

  // Link products to networks
  for (const product of createdProducts) {
    await prisma.productNetwork.create({
      data: {
        productId: product.id,
        networkId: networkMain.id,
      },
    });
  }
  console.log('✓ Linked all products to Main Network');

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
