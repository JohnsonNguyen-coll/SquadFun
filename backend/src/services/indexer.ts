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

const setupTokenListeners = (tokenAddress: string, symbol: string, provider: ethers.Provider) => {
  if (activeListeners.has(tokenAddress.toLowerCase())) return;
  
  const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
  console.log(`  - Listening on: ${symbol} (${tokenAddress})`);

  // 1. Listen for Purchases
  contract.on("TokensPurchased", async (buyer, monIn, tokensOut, newPrice, event) => {
    const monAmountStr = ethers.formatEther(monIn);
    const tokenAmountStr = ethers.formatUnits(tokensOut, 18);
    const priceStr = ethers.formatEther(newPrice);
    const txHash = event.log.transactionHash;

    console.log(`\n💰 BUY EVENT: ${tokenAmountStr} ${symbol} bought by ${buyer}`);
    const lowerTxHash = txHash.toLowerCase();
    const lowerBuyer = buyer.toLowerCase();

    try {
      // Kiểm tra xem txHash đã được xử lý chưa
      const existingTrade = await prisma.trade.findUnique({ where: { txHash: lowerTxHash } });
      if (existingTrade) {
        console.log(`⚠️ Transaction ${lowerTxHash} already indexed. Skipping.`);
        return;
      }

      await prisma.$transaction([
        prisma.trade.create({
          data: {
            tokenAddress: tokenAddress.toLowerCase(),
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
          where: { contractAddress: tokenAddress },
          data: {
            price: priceStr,
            circulatingSupply: { increment: tokenAmountStr },
            reserveMon: { increment: monAmountStr },
            marketCap: (Number(priceStr) * 1_000_000_000).toString()
          } as any
        }),
        prisma.user.upsert({
          where: { walletAddress: lowerBuyer },
          update: { totalTraded: { increment: 1 } },
          create: { walletAddress: lowerBuyer, totalTraded: 1, username: `user_${lowerBuyer.slice(2, 6)}` }
        })
      ]);

      console.log(`✅ Indexed Buy for ${symbol}. Broadcasting...`);
      broadcast(tokenAddress, 'trade_update', {
        tokenAddress: tokenAddress.toLowerCase(),
        type: 'buy',
        price: priceStr,
        monAmount: monAmountStr,
        tokenAmount: tokenAmountStr,
        traderAddress: buyer,
        txHash: txHash
      });
    } catch (error) {
      console.error(`❌ Error indexing Buy for ${symbol}:`, error);
    }
  });

  // 2. Listen for Sales
  contract.on("TokensSold", async (seller, tokensIn, monOut, newPrice, event) => {
    const monAmountStr = ethers.formatEther(monOut);
    const tokenAmountStr = ethers.formatUnits(tokensIn, 18);
    const priceStr = ethers.formatEther(newPrice);
    const txHash = event.log.transactionHash;

    console.log(`\n📉 SELL EVENT: ${tokenAmountStr} ${symbol} sold by ${seller}`);
    const lowerTxHash = txHash.toLowerCase();
    const lowerSeller = seller.toLowerCase();

    try {
      // Kiểm tra xem txHash đã được xử lý chưa
      const existingTrade = await prisma.trade.findUnique({ where: { txHash: lowerTxHash } });
      if (existingTrade) {
        console.log(`⚠️ Transaction ${lowerTxHash} already indexed. Skipping.`);
        return;
      }

      await prisma.$transaction([
        prisma.trade.create({
          data: {
            tokenAddress: tokenAddress.toLowerCase(),
            traderAddress: lowerSeller,
            type: 'sell',
            ethAmount: monAmountStr,
            tokenAmount: tokenAmountStr,
            priceAtTrade: priceStr,
            txHash: lowerTxHash,
            timestamp: new Date()
          }
        }),
        prisma.token.update({
          where: { contractAddress: tokenAddress },
          data: {
            price: priceStr,
            circulatingSupply: { decrement: tokenAmountStr },
            reserveMon: { decrement: monAmountStr },
            marketCap: (Number(priceStr) * 1_000_000_000).toString()
          } as any
        }),
        prisma.user.upsert({
          where: { walletAddress: lowerSeller },
          update: { totalTraded: { increment: 1 } },
          create: { walletAddress: lowerSeller, totalTraded: 1, username: `user_${lowerSeller.slice(2, 6)}` }
        })
      ]);

      console.log(`✅ Indexed Sell for ${symbol}. Broadcasting...`);
      broadcast(tokenAddress, 'trade_update', {
        tokenAddress: tokenAddress.toLowerCase(),
        type: 'sell',
        price: priceStr,
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
  
  let provider: ethers.Provider;
  if (providerUrl.startsWith('wss')) {
    console.log('🌐 Using WebSocketProvider for indexer');
    provider = new ethers.WebSocketProvider(providerUrl);
  } else {
    console.log('🌐 Using JsonRpcProvider for indexer');
    provider = new ethers.JsonRpcProvider(providerUrl);
    (provider as ethers.JsonRpcProvider).pollingInterval = 1000; // Poll every 1 second for faster updates
  }

  try {
    // 1. Setup listeners for existing tokens
    const tokens = await prisma.token.findMany();
    console.log(`📦 Monitoring ${tokens.length} existing tokens...`);
    for (const token of tokens) {
      setupTokenListeners(token.contractAddress, token.symbol, provider);
    }

    // 2. Setup listener for Factory to pick up NEW tokens
    const factoryAddress = process.env.FACTORY_ADDRESS;
    if (factoryAddress) {
      console.log(`🏭 Listening for new tokens on Factory: ${factoryAddress}`);
      const factoryContract = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
      
      factoryContract.on("TokenCreated", async (tokenAddress, name, symbol, description, imageUrl, creator) => {
        const lowerTokenAddress = tokenAddress.toLowerCase();
        const lowerCreator = creator.toLowerCase();
        
        console.log(`✨ NEW TOKEN DETECTED: ${name} (${symbol}) at ${lowerTokenAddress}`);
        
        try {
          // Create token in database
          await prisma.token.create({
            data: {
              contractAddress: lowerTokenAddress,
              name,
              symbol,
              description,
              imageUrl,
              creatorAddress: lowerCreator,
              totalSupply: 1000000000,
              circulatingSupply: 0,
              price: 0,
              marketCap: 0,
              reserveMon: 0
            } as any
          });

          // Update creator's count
          await prisma.user.upsert({
            where: { walletAddress: lowerCreator },
            update: { totalCreated: { increment: 1 } },
            create: { walletAddress: lowerCreator, totalCreated: 1, username: `user_${lowerCreator.slice(2, 6)}` }
          });

          console.log(`✅ Indexed New Token: ${symbol}`);
          
          // Start listening to events for this new token
          setupTokenListeners(lowerTokenAddress, symbol, provider);
        } catch (error) {
          console.error('❌ Error indexing TokenCreated:', error);
          // Still try to setup listeners if it already exists
          setupTokenListeners(lowerTokenAddress, symbol, provider);
        }
      });
    }

  } catch (error) {
    console.error('❌ Failed to start indexer:', error);
  }
};
