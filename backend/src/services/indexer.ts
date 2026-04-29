import { ethers } from 'ethers';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { broadcast } from './socketService.js';

dotenv.config();

const prisma = new PrismaClient();

const TOKEN_ABI = [
  "event TokensPurchased(address indexed buyer, uint256 monIn, uint256 tokensOut, uint256 newPrice)",
  "event TokensSold(address indexed seller, uint256 tokensIn, uint256 monOut, uint256 newPrice)",
  "event Graduated(address indexed tokenAddress, address uniswapPool)"
];

const FACTORY_ABI = [
  "event TokenCreated(address indexed tokenAddress, string name, string symbol, string description, string imageUrl, address creator)"
];

const activeListeners = new Set<string>();

// Helper to process a buy event (reusable for initial buy and subsequent buys)
const processBuyEvent = async (tokenAddress: string, symbol: string, buyer: string, monIn: bigint, tokensOut: bigint, newPrice: bigint, txHash: string) => {
    const monAmountStr = ethers.formatEther(monIn);
    const tokenAmountStr = ethers.formatUnits(tokensOut, 18);
    const priceStr = ethers.formatEther(newPrice);
    const lowerTxHash = txHash.toLowerCase();
    const lowerBuyer = buyer.toLowerCase();
    const lowerTokenAddress = tokenAddress.toLowerCase();

    try {
      const existingTrade = await prisma.trade.findUnique({ where: { txHash: lowerTxHash } });
      if (existingTrade) return;

      const token = await prisma.token.findUnique({ where: { contractAddress: lowerTokenAddress } });
      const currentReserve = Number(token?.reserveMon || 0);
      const newReserve = currentReserve + Number(monAmountStr);
      const newMC = (newReserve * 10 / 7).toString();

      await prisma.$transaction([
        prisma.trade.create({
          data: {
            tokenAddress: lowerTokenAddress,
            traderAddress: lowerBuyer,
            type: 'buy',
            ethAmount: monAmountStr,
            tokenAmount: tokenAmountStr,
            priceAtTrade: priceStr,
            txHash: lowerTxHash,
            timestamp: new Date()
          }
        }),
        prisma.token.update({
          where: { contractAddress: lowerTokenAddress },
          data: {
            price: priceStr,
            circulatingSupply: { increment: Number(tokenAmountStr) },
            reserveMon: newReserve,
            marketCap: newMC
          } as any
        }),
        prisma.user.upsert({
          where: { walletAddress: lowerBuyer },
          update: { totalTraded: { increment: 1 } },
          create: { walletAddress: lowerBuyer, totalTraded: 1, username: `user_${lowerBuyer.slice(2, 6)}` }
        })
      ]);

      broadcast(lowerTokenAddress, 'trade_update', {
        tokenAddress: lowerTokenAddress,
        type: 'buy',
        price: priceStr,
        marketCap: newMC,
        monAmount: monAmountStr,
        tokenAmount: tokenAmountStr,
        traderAddress: buyer,
        txHash: txHash
      });
      console.log(`✅ Indexed Buy for ${symbol}`);
    } catch (error) {
      console.error(`❌ Error indexing Buy for ${symbol}:`, error);
    }
};

const setupTokenListeners = (tokenAddress: string, symbol: string, provider: ethers.Provider) => {
  if (activeListeners.has(tokenAddress.toLowerCase())) return;
  const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
  console.log(`  - Listening on: ${symbol} (${tokenAddress})`);

  contract.on("TokensPurchased", (buyer, monIn, tokensOut, newPrice, event) => {
    processBuyEvent(tokenAddress, symbol, buyer, monIn, tokensOut, newPrice, event.log.transactionHash);
  });

  contract.on("TokensSold", async (seller, tokensIn, monOut, newPrice, event) => {
    const monAmountStr = ethers.formatEther(monOut);
    const tokenAmountStr = ethers.formatUnits(tokensIn, 18);
    const priceStr = ethers.formatEther(newPrice);
    const txHash = event.log.transactionHash;

    try {
      const existingTrade = await prisma.trade.findUnique({ where: { txHash: txHash.toLowerCase() } });
      if (existingTrade) return;

      const token = await prisma.token.findUnique({ where: { contractAddress: tokenAddress.toLowerCase() } });
      const currentReserve = Number(token?.reserveMon || 0);
      const newReserve = Math.max(0, currentReserve - Number(monAmountStr));
      const newMC = (newReserve * 10 / 7).toString();

      await prisma.$transaction([
        prisma.trade.create({
          data: {
            tokenAddress: tokenAddress.toLowerCase(),
            traderAddress: seller.toLowerCase(),
            type: 'sell',
            ethAmount: monAmountStr,
            tokenAmount: tokenAmountStr,
            priceAtTrade: priceStr,
            txHash: txHash.toLowerCase(),
            timestamp: new Date()
          }
        }),
        prisma.token.update({
          where: { contractAddress: tokenAddress.toLowerCase() },
          data: {
            price: priceStr,
            circulatingSupply: { decrement: Number(tokenAmountStr) },
            reserveMon: newReserve,
            marketCap: newMC
          } as any
        }),
        prisma.user.upsert({
          where: { walletAddress: seller.toLowerCase() },
          update: { totalTraded: { increment: 1 } },
          create: { walletAddress: seller.toLowerCase(), totalTraded: 1, username: `user_${seller.toLowerCase().slice(2, 6)}` }
        })
      ]);

      broadcast(tokenAddress.toLowerCase(), 'trade_update', {
        tokenAddress: tokenAddress.toLowerCase(),
        type: 'sell',
        price: priceStr,
        marketCap: newMC,
        monAmount: monAmountStr,
        tokenAmount: tokenAmountStr,
        traderAddress: seller,
        txHash: txHash
      });
    } catch (error) {
      console.error(`❌ Error indexing Sell for ${symbol}:`, error);
    }
  });

  activeListeners.add(tokenAddress.toLowerCase());
};

export const startIndexer = async () => {
  console.log('🚀 Starting Blockchain Indexer...');
  const providerUrl = process.env.MONAD_WS_URL || process.env.RPC_URL || 'https://testnet-rpc.monad.xyz';
  
  const provider = providerUrl.startsWith('wss') 
    ? new ethers.WebSocketProvider(providerUrl)
    : new ethers.JsonRpcProvider(providerUrl);

  try {
    const tokens = await prisma.token.findMany();
    for (const token of tokens) {
      setupTokenListeners(token.contractAddress, token.symbol, provider);
    }

    const factoryAddress = process.env.FACTORY_ADDRESS;
    if (factoryAddress) {
      const factoryContract = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
      factoryContract.on("TokenCreated", async (tokenAddress, name, symbol, description, imageUrl, creator, event) => {
        const lowerTokenAddress = tokenAddress.toLowerCase();
        const blockNumber = event.log.blockNumber;
        const txHash = event.log.transactionHash;

        try {
          await prisma.token.create({
            data: {
              contractAddress: lowerTokenAddress,
              name,
              symbol,
              description,
              imageUrl,
              creatorAddress: creator.toLowerCase(),
              totalSupply: 1000000000,
              circulatingSupply: 0,
              price: "0", 
              marketCap: "0", 
              reserveMon: 0
            } as any
          });
          
          await prisma.user.upsert({
            where: { walletAddress: creator.toLowerCase() },
            update: { totalCreated: { increment: 1 } },
            create: { walletAddress: creator.toLowerCase(), totalCreated: 1, username: `user_${creator.toLowerCase().slice(2, 6)}` }
          });

          setupTokenListeners(lowerTokenAddress, symbol, provider);

          // Check for initial buy in the same block
          const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
          if (tokenContract.filters && tokenContract.filters.TokensPurchased) {
            const filter = tokenContract.filters.TokensPurchased();
            const logs = await tokenContract.queryFilter(filter, blockNumber, blockNumber);
            
            for (const log of logs) {
              const parsed = tokenContract.interface.parseLog(log as any);
              if (parsed) {
                await processBuyEvent(tokenAddress, symbol, parsed.args.buyer, parsed.args.monIn, parsed.args.tokensOut, parsed.args.newPrice, log.transactionHash);
              }
            }
          }
        } catch (error) {
          console.error('❌ Error indexing TokenCreated:', error);
        }
      });
    }
  } catch (error) {
    console.error('❌ Failed to start indexer:', error);
  }
};
