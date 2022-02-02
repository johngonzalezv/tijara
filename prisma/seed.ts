import { PrismaClient } from '@prisma/client';
import { products } from '../data/products';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: 'test@gmail.com',
      role: 'ADMIN',
    },
  });

  await prisma.product.createMany({
    data: products,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect);
