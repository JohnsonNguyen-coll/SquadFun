export interface Token {
  id: string;
  contractAddress: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  creatorAddress: string;
  createdAt: string;
  marketCap: number;
  price: number;
  priceChange24h: number;
  reserveMon: bigint;
  graduated: boolean;
  totalSupply: bigint;
  circulatingSupply: bigint;
}

export const MOCK_TOKENS: Token[] = [
  {
    id: '1',
    contractAddress: '0x1234567890123456789012345678901234567890',
    name: 'Monad Dragon',
    symbol: 'DRAGON',
    description: 'The first dragon born on Monad Testnet. High speed, low drag.',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=dragon',
    creatorAddress: '0xabc...def',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    marketCap: 42000,
    price: 0.000042,
    priceChange24h: 15.5,
    reserveMon: 6500n * 10n**18n,
    graduated: false,
    totalSupply: 1000000000n * 10n**18n,
    circulatingSupply: 800000000n * 10n**18n,
  },
  {
    id: '2',
    contractAddress: '0x2234567890123456789012345678901234567890',
    name: 'Speedy Cat',
    symbol: 'SCAT',
    description: 'Meow! I am the fastest cat on the fastest EVM.',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cat',
    creatorAddress: '0xdef...123',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    marketCap: 12000,
    price: 0.000012,
    priceChange24h: -5.2,
    reserveMon: 1200n * 10n**18n,
    graduated: false,
    totalSupply: 1000000000n * 10n**18n,
    circulatingSupply: 200000000n * 10n**18n,
  },
  // Add more mock tokens as needed
];

for (let i = 3; i <= 20; i++) {
  MOCK_TOKENS.push({
    id: i.toString(),
    contractAddress: `0x${i}234567890123456789012345678901234567890`,
    name: `Meme ${i}`,
    symbol: `MEME${i}`,
    description: `Description for Meme ${i}`,
    imageUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=meme${i}`,
    creatorAddress: `0x${i}bc...def`,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    marketCap: Math.random() * 50000,
    price: Math.random() * 0.0001,
    priceChange24h: (Math.random() - 0.5) * 40,
    reserveMon: BigInt(Math.floor(Math.random() * 6000)) * 10n**18n,
    graduated: false,
    totalSupply: 1000000000n * 10n**18n,
    circulatingSupply: BigInt(Math.floor(Math.random() * 800000000)) * 10n**18n,
  });
}
