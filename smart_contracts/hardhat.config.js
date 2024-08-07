require("@nomicfoundation/hardhat-toolbox");

const { vars } = require("hardhat/config");

const INFURA_API_KEY = vars.get("INFURA_API_KEY");

const SEPOLIA_PRIVATE_KEY = vars.get("SEPOLIA_PRIVATE_KEY");

module.exports = {
  solidity: "0.8.26",
  networks: {
    sepolia: {
      url: `https://virtual.sepolia.rpc.tenderly.co/c2d30903-6706-428a-9e49-8e087c2871c5`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
};
