import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    flare: {
      url: "https://flare-api.flare.network/ext/bc/C/rpc",
      chainId: 14,
      accounts: {
        // You'll need to add your private key here for deployment
        // For now we'll use a placeholder
        mnemonic: "test test test test test test test test test test test junk"
      }
    },
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;
