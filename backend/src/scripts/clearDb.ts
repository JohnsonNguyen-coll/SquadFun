import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  
  await prisma.trade.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.token.deleteMany({});
  await prisma.user.deleteMany({});
  
  console.log('Database cleared successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
