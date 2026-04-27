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

export const MOCK_TOKENS: Token[] = [];
