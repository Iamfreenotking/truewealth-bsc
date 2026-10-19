import { defineConfig } from "hardhat/config";

export default defineConfig({
  networks: {
    bscFork: {
      type: "edr-simulated",
      chainId: 56,
      chainType: "generic",
      hardfork: "cancun",
      forking: { url: "https://bsc-dataseed.bnbchain.org" }
    }
  },
  solidity: {
    version: "0.8.30",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "paris"
    }
  }
});
