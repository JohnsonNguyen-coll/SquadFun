import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Normalizing addresses in database...');

  const tokens = await prisma.token.findMany();
  for (const token of tokens) {
    const lower = token.contractAddress.toLowerCase();
    if (token.contractAddress !== lower) {
      console.log(`  - Lowercasing Token: ${token.symbol} (${token.contractAddress} -> ${lower})`);
      try {
        await prisma.token.update({
          where: { id: token.id },
          data: { contractAddress: lower }
        });
      } catch (e) {
        console.error(`    FAILED: Maybe ${lower} already exists?`);
      }
    }
  }

  const trades = await prisma.trade.findMany();
  for (const trade of trades) {
    const lowerToken = trade.tokenAddress.toLowerCase();
    const lowerTrader = trade.traderAddress.toLowerCase();
    if (trade.tokenAddress !== lowerToken || trade.traderAddress !== lowerTrader) {
      await prisma.trade.update({
        where: { id: trade.id },
        data: { tokenAddress: lowerToken, traderAddress: lowerTrader }
      });
    }
  }

  const comments = await prisma.comment.findMany();
  for (const comment of comments) {
    const lowerToken = comment.tokenAddress.toLowerCase();
    const lowerAuthor = comment.authorAddress.toLowerCase();
    if (comment.tokenAddress !== lowerToken || comment.authorAddress !== lowerAuthor) {
      await prisma.comment.update({
        where: { id: comment.id },
        data: { tokenAddress: lowerToken, authorAddress: lowerAuthor }
      });
    }
  }

  console.log('✅ Normalization complete.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
