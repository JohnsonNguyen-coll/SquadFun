import { PrismaClient, Prisma } from '@prisma/client';
import { aggregateToCandles } from '../utils/chart.js';
const prisma = new PrismaClient();
export const getTokens = async (req, res) => {
    const { filter, search } = req.query;
    try {
        let where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { symbol: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (filter === 'graduating') {
            where.graduated = false;
        }
        else if (filter === 'graduated') {
            where.graduated = true;
        }
        const tokens = await prisma.token.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(tokens);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch tokens' });
    }
};
export const getTokenDetail = async (req, res) => {
    const address = req.params.address;
    try {
        const token = await prisma.token.findUnique({
            where: { contractAddress: address },
            include: {
                _count: {
                    select: { trades: true, comments: true }
                }
            }
        });
        if (!token)
            return res.status(404).json({ error: 'Token not found' });
        res.json(token);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch token details' });
    }
};
export const getTokenTrades = async (req, res) => {
    const address = req.params.address;
    const { page = 1, limit = 50 } = req.query;
    try {
        const trades = await prisma.trade.findMany({
            where: { tokenAddress: address },
            orderBy: { timestamp: 'desc' },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit)
        });
        res.json(trades);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch trades' });
    }
};
export const getChartData = async (req, res) => {
    const address = req.params.address;
    const { timeframe = '1h' } = req.query;
    const timeframes = {
        '1m': 60 * 1000,
        '5m': 5 * 60 * 1000,
        '1h': 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000
    };
    const timeframeMs = timeframes[timeframe] || timeframes['1h'];
    try {
        const trades = await prisma.trade.findMany({
            where: { tokenAddress: address },
            orderBy: { timestamp: 'asc' }
        });
        const candles = aggregateToCandles(trades, timeframeMs);
        res.json(candles);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
};
//# sourceMappingURL=tokenController.js.map