import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

// Manual type augmentation for etherscan if the plugin's automatic one fails
declare module "hardhat/types/config" {
  export interface HardhatUserConfig {
    etherscan?: {
      apiKey?: string | Record<string, string>;
      customChains?: Array<{
        network: string;
        chainId: number;
        urls: {
          apiURL: string;
          browserURL: string;
        };
      }>;
    };
  }
}

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    monadTestnet: {
      type: "http",
      url: "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      monadTestnet: "not-needed",
    },
    customChains: [
      {
        network: "monadTestnet",
        chainId: 10143,
        urls: {
          apiURL: "https://testnet.monadscan.com/api",
          browserURL: "https://testnet.monadscan.com",
        },
      },
    ],
  },
});
