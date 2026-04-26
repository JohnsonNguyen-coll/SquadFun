import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserProfile = async (req: Request, res: Response) => {
  const { address } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: address }
    });

    const createdTokens = await prisma.token.findMany({
      where: { creatorAddress: address },
      orderBy: { createdAt: 'desc' }
    });

    const trades = await prisma.trade.findMany({
      where: { traderAddress: address },
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: { token: true }
    });

    res.json({ user, createdTokens, trades });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};
