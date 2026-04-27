import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { broadcast } from '../index.js';

dotenv.config();

const prisma = new PrismaClient();
const provider = new ethers.WebSocketProvider(process.env.MONAD_WS_URL || 'wss://testnet-rpc.monad.xyz/ws');

// ABIs - simplified for the indexer
const FACTORY_ABI = [
  "event TokenCreated(address indexed tokenAddress, string name, string symbol, string description, string imageUrl, address creator)"
];

const TOKEN_ABI = [
  "event TokensPurchased(address indexed buyer, uint256 monIn, uint256 tokensOut, uint256 newPrice)",
  "event TokensSold(address indexed seller, uint256 tokensIn, uint256 monOut, uint256 newPrice)",
  "event Graduated(address indexed tokenAddress, address uniswapPool)"
];

export async function startIndexer() {
  console.log('Starting Blockchain Indexer...');

  const factoryAddress = process.env.FACTORY_ADDRESS!;
  const factoryContract = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);

  // Listen for new tokens
  factoryContract.on("TokenCreated", async (tokenAddress, name, symbol, description, imageUrl, creator, event) => {
    console.log(`New Token Created: ${name} at ${tokenAddress}`);
    
    try {
      await prisma.token.create({
        data: {
          contractAddress: tokenAddress,
          name,
          symbol,
          description,
          imageUrl,
          creatorAddress: creator,
          totalSupply: 1000000000, // as per contract
          circulatingSupply: 0,
          reserveMon: 0,
          price: 0,
          priceChange24h: 0,
        } as any
      });
      
      // Update creator's count
      await prisma.user.upsert({
        where: { walletAddress: creator },
        update: { totalCreated: { increment: 1 } },
        create: { walletAddress: creator, totalCreated: 1 }
      });

      // Start listening to this new token's events
      indexTokenEvents(tokenAddress);
      
    } catch (error) {
      console.error('Error indexing TokenCreated:', error);
    }
  });

  // Index existing tokens on startup
  const tokens = await prisma.token.findMany({ where: { graduated: false } });
  tokens.forEach(token => indexTokenEvents(token.contractAddress));
}

async function indexTokenEvents(tokenAddress: string) {
  const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);

  tokenContract.on("TokensPurchased", async (buyer, monIn, tokensOut, newPrice, event) => {
    console.log(`Purchase: ${tokensOut} tokens for ${monIn} MON`);
    
    const monAmount = parseFloat(ethers.formatEther(monIn));
    const tokenAmount = parseFloat(ethers.formatEther(tokensOut));
    const price = parseFloat(ethers.formatEther(newPrice));

    try {
      await prisma.$transaction([
        prisma.trade.create({
          data: {
            tokenAddress,
            traderAddress: buyer,
            type: 'buy',
            ethAmount: monAmount,
            tokenAmount,
            priceAtTrade: price,
            txHash: event.log.transactionHash,
          }
        }),
        prisma.token.update({
          where: { contractAddress: tokenAddress },
          data: {
            circulatingSupply: { increment: tokenAmount },
            price: price,
            reserveMon: { increment: monAmount },
            marketCap: price * 1000000000, // price * totalSupply
          } as any
        }),
        prisma.user.upsert({
          where: { walletAddress: buyer },
          update: { totalTraded: { increment: 1 } },
          create: { walletAddress: buyer, totalTraded: 1 }
        })
      ]);
      
      // Notify via WebSocket
      broadcast(tokenAddress, 'trade_update', {
        tokenAddress,
        type: 'buy',
        price,
        monAmount,
        tokenAmount
      });
    } catch (error) {
      console.error('Error indexing TokensPurchased:', error);
    }
  });

  tokenContract.on("TokensSold", async (seller, tokensIn, monOut, newPrice, event) => {
    console.log(`Sale: ${tokensIn} tokens for ${monOut} MON`);
    
    const monAmount = parseFloat(ethers.formatEther(monOut));
    const tokenAmount = parseFloat(ethers.formatEther(tokensIn));
    const price = parseFloat(ethers.formatEther(newPrice));

    try {
      await prisma.$transaction([
        prisma.trade.create({
          data: {
            tokenAddress,
            traderAddress: seller,
            type: 'sell',
            ethAmount: monAmount,
            tokenAmount,
            priceAtTrade: price,
            txHash: event.log.transactionHash,
          }
        }),
        prisma.token.update({
          where: { contractAddress: tokenAddress },
          data: {
            circulatingSupply: { decrement: tokenAmount },
            price: price,
            reserveMon: { decrement: monAmount },
            marketCap: price * 1000000000,
          } as any
        }),
      ]);

      // Notify via WebSocket
      broadcast(tokenAddress, 'trade_update', {
        tokenAddress,
        type: 'sell',
        price,
        monAmount,
        tokenAmount
      });
    } catch (error) {
      console.error('Error indexing TokensSold:', error);
    }
  });

  tokenContract.on("Graduated", async (tokenAddress, uniswapPool) => {
    console.log(`Token Graduated: ${tokenAddress} -> ${uniswapPool}`);
    try {
      await prisma.token.update({
        where: { contractAddress: tokenAddress },
        data: {
          graduated: true,
          uniswapPool
        }
      });
    } catch (error) {
      console.error('Error indexing Graduated:', error);
    }
  });
}
