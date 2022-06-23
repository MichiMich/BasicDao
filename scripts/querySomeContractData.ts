import { propose } from './propose';
import { voteSpecific } from './voteSpecific';
import { queueAndExecute } from './queue-and-execute';
import { NEW_STORE_VALUE, FUNC, PROPOSAL_DESCRIPTION, developmentChains, VOTING_DELAY, proposalsFile, VOTING_PERIOD } from "../helper-hardhat-config";
// @ts-ignore
import { ethers, network } from "hardhat"
import * as fs from "fs";

import { moveBlocks } from "../utils/move-blocks";

async function querySomeContractData() {
    const governor = await ethers.getContract("GovernorContract")
    const timeLock = await ethers.getContract("TimeLock")
    const governanceToken = await ethers.getContract("GovernanceToken")
    const box = await ethers.getContract("Box")

    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    const proposalId = proposals[network.config.chainId!][0];

    // @ts-ignore
    const { voter1, voter2 } = await hre.ethers.getNamedSigners();

    console.log("Has voted voter1: ", await governor.hasVoted(proposalId, voter1.address));
    console.log("Has voted voter2: ", await governor.hasVoted(proposalId, voter2.address));

    //try reading private _proposalVotes mapping, with proposalId it shows for and against votes
    // governor._proposalVotes[proposalId]
    //governor._proposalVotes[proposalId].hasVoted[account]
    //governor._proposalVotes[proposalId].forVotes
    //governor._proposalVotes[proposalId].againstVotes
    //governor._proposalVotes[proposalId].abstainVotes

    //read proposalVotes
    console.log("ProposalVotesData: ", await governor.proposalVotes(proposalId));

    /* 
        //we want to get to the end of the voting period
        if (developmentChains.includes(network.name)) {
            await moveBlocks(VOTING_PERIOD + 1);
        }
    
        //results in 0 values
        console.log("total proposalVotes: \n\n", await governor.proposalVotes(proposalId));
    */
}

querySomeContractData().then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); //this calls the store function of the box contract with the value 77