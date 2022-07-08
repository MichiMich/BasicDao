
import "@typechain/hardhat"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-ethers"
import "dotenv/config"
import "hardhat-deploy"
import "@nomiclabs/hardhat-waffle"
import { HardhatUserConfig } from "hardhat/config";

import { node_url, accounts } from './utils/network';
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
// module.exports = {
//   solidity: "0.8.8",
// };

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY || "privatKey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      allowUnlimitedContractSize: true
    },
    localhost: {
      chainId: 31337,
      allowUnlimitedContractSize: true
    },
    rinkeby: {
      url: node_url('rinkeby'), //RINKEBY_RPC_URL,
      accounts: accounts('rinkeby'),
      chainId: 4,
    },
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        //optimizer and runs enabled, so governor contract can be deployed (it exceeds the 24576 bytes limit)
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, //this would be on mainnet and thake the first account as deployer
      // @ts-ignore
      4: "privatekey://" + process.env.PRIVATEKEY_RINKEBY, //rinkeby
    },
    voter1: {
      default: 1, // here this will by default take the second account as voter
      // @ts-ignore
      4: "privatekey://" + process.env.PRIVATEKEY_RINKEBY_VOTER1, //rinkeby
    },
    voter2: {
      default: 2, // here this will by default take the second account as voter
      // @ts-ignore
      4: "privatekey://" + process.env.PRIVATEKEY_RINKEBY_VOTER2, //rinkeby
    },
    voter3: {
      default: 3, // here this will by default take the second account as voter
      // @ts-ignore
      4: "privatekey://" + process.env.PRIVATEKEY_RINKEBY_VOTER3, //rinkeby
    }
  }
}

export default config;