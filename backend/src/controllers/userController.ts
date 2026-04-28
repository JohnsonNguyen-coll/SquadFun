import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserProfile = async (req: Request, res: Response) => {
  const address = (req.params.address as string).toLowerCase();
  
  try {
    const user = await prisma.user.findUnique({
      where: { walletAddress: address }
    });

    // Lấy danh sách token do user này tạo
    const createdTokens = await prisma.token.findMany({
      where: { creatorAddress: address },
      orderBy: { createdAt: 'desc' }
    });

    // Lấy danh sách giao dịch của user này
    const trades = await prisma.trade.findMany({
      where: { traderAddress: address },
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: { token: true }
    });

    const totalTradedCount = await prisma.trade.count({
      where: { traderAddress: address }
    });

    res.json({
      profile: user ? { ...user, totalTraded: totalTradedCount } : { walletAddress: address, totalCreated: 0, totalTraded: totalTradedCount },
      tokens: createdTokens,
      trades
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { walletAddress, username, avatarUrl, bio } = req.body;
  const lowerAddress = walletAddress.toLowerCase();
  
  try {
    const updatedUser = await prisma.user.upsert({
      where: { walletAddress: lowerAddress },
      update: { username, avatarUrl, bio },
      create: { walletAddress: lowerAddress, username, avatarUrl, bio }
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const syncUser = async (req: Request, res: Response) => {
  const { walletAddress } = req.body;
  const lowerAddress = walletAddress.toLowerCase();
  try {
    const user = await prisma.user.upsert({
      where: { walletAddress: lowerAddress },
      update: {}, 
      create: { walletAddress: lowerAddress } 
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync user' });
  }
};
