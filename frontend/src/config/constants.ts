export const GRADUATION_TARGET = 6900n; // 6900 MON in bigint (wei equivalent if 18 decimals)
export const CREATION_FEE = 1n; // 1 MON
export const TOTAL_SUPPLY = 1_000_000_000n; // 1 Billion tokens
export const BASE_PRICE = 0.000001; // Starting price in MON

export const MONAD_TESTNET_CONFIG = {
  chainId: 10143,
  name: 'Monad Testnet',
  rpcUrl: 'https://testnet-rpc.monad.xyz',
  blockExplorer: 'https://testnet.monadexplorer.com',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
};

export const ROUTES = {
  HOME: '/',
  TOKEN_DETAIL: '/token/:address',
  CREATE: '/create',
  PROFILE: '/profile/:address',
  LEADERBOARD: '/leaderboard',
};
