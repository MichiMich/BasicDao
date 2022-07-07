# BasicDao

I created this dao by coding along at [How to build an on-chain DAO](https://www.youtube.com/watch?v=AhJtmUqhAqg&t=1668s) and adapted it for my needs.

- [Configuration](#configuration)
  - [ERC721](#erc721)
  - [ERC20](#erc20)
- [Governor contract](#governor)
- [Getting Started](#getting-started)
  - [Requirements](#requirements)
  - [Installation](#installation)
- [Execution after proposal](#execution)
  - [configuration 1 - Box.sol](#config1)
  - [configuration 2 - NftCollection.sol](#config2)
- [Full DAO](#fulldaocycle)

## Configuration
The governor and voting can take place by an ERC20 or ERC721 token, depending on the config at `helper-hardhat-config.ts`

The settings of `governorContractName` and `governanceTokenContractName` define the contract name which will be deployed at `/deploy/01-deploy-governor-token.ts` and `/deploy/03-deploy-governor-contract.ts`.
Furthermore it defines with which contracts the tests in the folder `/test/` interact. 

### ERC721
Running with ERC721 config will mint an ERC721 token, delegate the voting power and voting with an ERC721 token. 1 Token = 1 Vote, 1 token max per wallet see the `mint() functions` at /contracts/GovernanceTokenERC721.sol.

Configuration for voting with an ERC721 token at helper-hardhat-config.ts: 
```
export const governorContractName = "GovernorERC721";
export const governanceTokenContractName = "GovernanceTokenERC721";
```
### ERC20
Running with ERC20 config will mint an ERC20 token, delegate the voting power and voting with an ERC20 token. 1 token max per wallet see the `mint() functions` at /contracts/GovernanceTokenERC20.sol. /*will be adapted*/

Configuration for voting with an ERC20 token at helper-hardhat-config.ts: 
```
export const governorContractName = "GovernorERC20";
export const governanceTokenContractName = "GovernanceTokenERC20";
```


## Governor
The GovernorContract is configured by the [openzeppeling wizzard](https://docs.openzeppelin.com/contracts/4.x/wizard)
and adapted to handover the voting delay and voting period with the constructor.
```
constructor(
        IVotes _token,
        TimelockController _timelock,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _quorumPercentage
    )
```

## Getting started
You can work with this repo in browser if you want with:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/MichiMich/BasicDao)

### Requirements

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - You'll know you did it right if you can run `git --version` and you see a response like `git version x.x.x`
- [Nodejs](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run:
    - `node --version`and get an ouput like: `vx.x.x`
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) instead of `npm`
  - You'll know you've installed yarn right if you can run:
    - `yarn --version` And get an output like: `x.x.x`
    - You might need to install it with npm


### Installation

1. Clone this repo:
```
git clone https://github.com/MichiMich/BasicDao
cd Dao
```
2. Install dependencies
```
yarn
```

or 

```
npm i 
```


3. Add a `.env` file with the same contents of `.env.example`, but replaced with your variables.

![WARNING](https://via.placeholder.com/15/f03c15/000000?text=+)**WARNING** ![WARNING](https://via.placeholder.com/15/f03c15/000000?text=+)
> DO NOT PUSH YOUR PRIVATE_KEY TO GITHUB

> Add your data at the .env file and add .env to the gitignore file. It is highly recommended to create and use a development wallet for this only, whithout mainnet tokens in it!

## Execution


### config1 
at helper-hardhat-config.ts - interact with NftCollection.sol 
```
export const contractNameWhereActionTakesPlace = "NftCollection";
export const argsForFuncExecution = ["0xaf6344bc7bc538dcf7179c36fc57ccae302c1bbb", "OCAA"];
export const FUNC = "addCollection";
export const PROPOSAL_DESCRIPTION = "Proposal #1 add ocaa to nft collection";
```
This calls the `addCollection` function of the contract `NftCollection.sol` the contract address "0xaf6344bc7bc538dcf7179c36fc57ccae302c1bbb" and the name "OCAA" if 
the proposal succeeds - `Nftcollection.addCollection("0xaf6344bc7bc538dcf7179c36fc57ccae302c1bbb","OCAA")`


### config2
at helper-hardhat-config.ts - interact with Box.sol 
```
export const contractNameWhereActionTakesPlace = "Box";
export const argsForFuncExecution = [77];
export const FUNC = "store";
export const PROPOSAL_DESCRIPTION = "Proposal #1: Store 77 in the Box!";
```

This calls the `store` function with the value `77` of the contract `Box.sol` if the proposal succeeded - `Box.store(77)`.


## FullDaoCycle
Run a full cycle of the dao on local network:

1. Mint tokens, delegate vote
2. propose
3. vote on that proposal
4. if proposal succeeded: queue- and execute the proposal

 first terminal, run the local node with (deploys all contracts at /deploy/): 
```
yarn hardhat node
```
second terminal, run the script:
```
yarn hardhat run scripts/runVoteCycle.ts --network localhost
```
or:
```
yarn hardhat test --network localhost --grep "mint tokens,fetch tokenURI"
```

If working on testnet or mainnet:

**Remember on testnet the delays like VOTING_PERIOD and VOTING_DELAY need to pass (which are moved at local chain)**




