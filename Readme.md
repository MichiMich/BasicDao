# BasicDao

I created this dao by coding along at [How to build an on-chain DAO](https://www.youtube.com/watch?v=AhJtmUqhAqg&t=1668s) and adapted it for my needs.

- [Getting Started](#getting-started)
  - [Requirements](#requirements)
    - [Installation](#installation)
- [Usage](#usage)

# About

## GovernorContract
The GovernorContract is configured by the [openzeppeling wizzard](https://docs.openzeppelin.com/contracts/4.x/wizard)
and adapted to handover the voting delay and voting period with the constructor.


## Voting mechanism:

This basic dao project uses an ERC20 token as a voting standard which is realized by the the GovernanceToken.sol contract.

# Getting started
You can work with this repo in browser if you want with:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/MichiMich/BasicDao)

## Requirements

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
![WARNING](https://via.placeholder.com/15/f03c15/000000?text=+) **WARNING** ![WARNING](https://via.placeholder.com/15/f03c15/000000?text=+)
> DO NOT PUSH YOUR PRIVATE_KEY TO GITHUB

Add your data at the .env file and add .env to the gitignore file
It is highly recommended to create and use a development wallet for this only, whithout mainnet tokens in it!


## Usage

Run a full cycle of the dao on locla network:

a) propose a new value to be added to the Box contract

b) vote on that proposal

c) queue- and execute the proposal

 first terminal, run the local node with: 
```
yarn hardhat node
```
second terminal, run the script:
```
yarn hardhat run scripts/runVoteCycle.ts --network localhost
```

Deploying on testnet:

**Remember on testnet the delays like VOTING_PERIOD and VOTING_DELAY need to pass (which are moved at local chain)**




