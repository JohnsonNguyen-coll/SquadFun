import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const tokens = await prisma.token.findMany({
      orderBy: { marketCap: 'desc' },
      take: 10
    });
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
