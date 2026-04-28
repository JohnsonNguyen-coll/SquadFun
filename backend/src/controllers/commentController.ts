import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

import { broadcast } from '../services/socketService.js';

const prisma = new PrismaClient();

export const getComments = async (req: Request, res: Response) => {
  const address = req.params.address as string;
  try {
    const comments = await prisma.comment.findMany({
      where: { tokenAddress: address.toLowerCase() },
      orderBy: { createdAt: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const createComment = async (req: Request, res: Response) => {
  const address = req.params.address as string;
  const { content, signature, walletAddress } = req.body;

  if (!content || !signature || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Verify signature
    const message = `I am commenting on ${address.toLowerCase()}: ${content}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const comment = await prisma.comment.create({
      data: {
        tokenAddress: address.toLowerCase(),
        authorAddress: walletAddress.toLowerCase(),
        content
      }
    });
    
    // Broadcast real-time comment
    broadcast(address, 'comment_new', comment);
    
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
};
