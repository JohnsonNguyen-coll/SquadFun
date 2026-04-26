import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';
const prisma = new PrismaClient();
export const getComments = async (req, res) => {
    const address = req.params.address;
    try {
        const comments = await prisma.comment.findMany({
            where: { tokenAddress: address },
            orderBy: { createdAt: 'desc' }
        });
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch comments' });
    }
};
export const createComment = async (req, res) => {
    const address = req.params.address;
    const { content, signature, walletAddress } = req.body;
    if (!content || !signature || !walletAddress) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        // Verify signature
        const message = `I am commenting on ${address}: ${content}`;
        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
            return res.status(401).json({ error: 'Invalid signature' });
        }
        const comment = await prisma.comment.create({
            data: {
                tokenAddress: address,
                authorAddress: walletAddress,
                content
            }
        });
        res.json(comment);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create comment' });
    }
};
//# sourceMappingURL=commentController.js.map