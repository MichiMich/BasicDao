import { TimeLock } from "../typechain-types"

// @ts-ignore
import { ethers, network } from "hardhat"
const { deployments } = require('hardhat');
import { assert, expect } from "chai"
import { mintAndDelegate, propose, voteSpecific, queue, execute } from "../scripts/daoFunctions";
import { contractNameWhereActionTakesPlace, argsForFuncExecution, FUNC, PROPOSAL_DESCRIPTION, developmentChains, VOTING_DELAY, VOTING_PERIOD, proposalsFile, MIN_DELAY } from "../helper-hardhat-config";

import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"
import { proposalStateToText } from "../helpfulScript"

import { runVoteCycleNft } from "../scripts/runVoteCycle"
import {
    governorContractName,
    governanceTokenContractName
} from "../helper-hardhat-config"
/* 
pretty basic test for one vote cycle, needs to be extended with more votes against,
queuing and executing if failed, check if function is executed on contract after succeeded
*/

describe("nft test", async () => {
    let GovernanceTokenERC721: any;
    let accounts: any;
    beforeEach(async () => {
        //get available accounts from hardhat
        accounts = await hre.ethers.getSigners();
        console.log("deploy contracts before test")
        await deployments.fixture(); //see https://github.com/wighawag/hardhat-deploy#hardhat-deploy-in-a-nutshell
        GovernanceTokenERC721 = await ethers.getContract("GovernanceTokenERC721");
    })

    it("mint tokens,fetch tokenURI", async () => {

        for (let i = 0; i < 2; i++) {
            await GovernanceTokenERC721.connect(accounts[i]).mint();
            let tokenURI = await GovernanceTokenERC721.tokenURI(i);
            console.log("tokenURI of " + i + ": " + tokenURI + "\n");
        }


    });

});