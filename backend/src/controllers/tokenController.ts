import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { aggregateToCandles } from '../utils/chart.js';

const prisma = new PrismaClient();

export const getTokens = async (req: Request, res: Response) => {
  const { filter, search } = req.query;
  
  try {
    let where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { symbol: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (filter === 'graduating') {
      where.graduated = false;
    } else if (filter === 'graduated') {
      where.graduated = true;
    }

    const tokens = await prisma.token.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    
    res.json(tokens);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
};

export const getTokenDetail = async (req: Request, res: Response) => {
  const { address } = req.params;
  try {
    const token = await prisma.token.findUnique({
      where: { contractAddress: address },
      include: {
        _count: {
          select: { trades: true, comments: true }
        }
      }
    });
    
    if (!token) return res.status(404).json({ error: 'Token not found' });
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch token details' });
  }
};

export const getTokenTrades = async (req: Request, res: Response) => {
  const { address } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  try {
    const trades = await prisma.trade.findMany({
      where: { tokenAddress: address },
      orderBy: { timestamp: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
};

export const getChartData = async (req: Request, res: Response) => {
  const { address } = req.params;
  const { timeframe = '1h' } = req.query;

  const timeframes = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000
  };

  const timeframeMs = timeframes[timeframe as keyof typeof timeframes] || timeframes['1h'];

  try {
    const trades = await prisma.trade.findMany({
      where: { tokenAddress: address },
      orderBy: { timestamp: 'asc' }
    });

    const candles = aggregateToCandles(trades, timeframeMs);
    res.json(candles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
};
