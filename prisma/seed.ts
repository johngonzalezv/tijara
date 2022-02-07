import { PrismaClient } from '@prisma/client';
import { products } from '../data/products';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      id: '6a9d58b6-f961-4b95-8797-57d43773e622',
      email: 'test@gmail.com',
      role: 'PROVIDER',
      company: 'Sephtone',
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
