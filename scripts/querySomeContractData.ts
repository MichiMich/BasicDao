import { proposalsFile } from "../helper-hardhat-config";
// @ts-ignore
import { ethers, network } from "hardhat"
import * as fs from "fs";
import { proposalStateToText } from "../helpfulScript";

async function querySomeContractData() {
    const governor = await ethers.getContract("GovernorContract")
    const timeLock = await ethers.getContract("TimeLock")
    const governanceToken = await ethers.getContract("GovernanceToken")
    const box = await ethers.getContract("Box")

    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    const proposalId = proposals[network.config.chainId!][0];

    // @ts-ignore
    const { voter1, voter2, voter3 } = await hre.ethers.getNamedSigners();

    console.log("Has voted voter1: ", await governor.hasVoted(proposalId, voter1.address));
    console.log("Has voted voter2: ", await governor.hasVoted(proposalId, voter2.address));
    console.log("Has voted voter3: ", await governor.hasVoted(proposalId, voter3.address));

    //try reading private _proposalVotes mapping, with proposalId it shows for and against votes
    // governor._proposalVotes[proposalId]
    //governor._proposalVotes[proposalId].hasVoted[account]
    //governor._proposalVotes[proposalId].forVotes
    //governor._proposalVotes[proposalId].againstVotes
    //governor._proposalVotes[proposalId].abstainVotes

    const proposalState = await governor.state(proposalId);
    console.log("\n\nProposal state: " + proposalStateToText(proposalState));
    //read proposalVotes
    const proposalVotesData = await governor.proposalVotes(proposalId);
    console.log("ProposalVotesData: ", proposalVotesData);

    console.log("Against votes: ", proposalVotesData.againstVotes.toString());
    console.log("For votes: ", proposalVotesData.forVotes.toString());
    console.log("Abstain votes: ", proposalVotesData.abstainVotes.toString());


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