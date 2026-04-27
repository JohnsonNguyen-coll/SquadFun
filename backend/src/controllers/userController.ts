import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserProfile = async (req: Request, res: Response) => {
  const address = req.params.address as string;
  
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

    res.json({
      profile: user || { walletAddress: address, totalCreated: 0, totalTraded: 0 },
      tokens: createdTokens,
      trades
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { walletAddress, username, avatarUrl, bio } = req.body;
  
  try {
    const updatedUser = await prisma.user.upsert({
      where: { walletAddress },
      update: { username, avatarUrl, bio },
      create: { walletAddress, username, avatarUrl, bio }
    });
    
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const syncUser = async (req: Request, res: Response) => {
  const { walletAddress } = req.body;
  try {
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {}, // Không thay đổi gì nếu đã có
      create: { walletAddress } // Tạo mới nếu chưa có
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync user' });
  }
};
