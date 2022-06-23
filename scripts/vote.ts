import { proposalsFile, NEW_STORE_VALUE, developmentChains, VOTING_PERIOD } from "../helper-hardhat-config";
import * as fs from "fs";
// @ts-ignore
import { ethers, network } from "hardhat";
import { moveBlocks } from "../utils/move-blocks";
import { proposalStateToText } from "../helpfulScript";

export async function vote(proposalIndex: number) {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    const propsalId = proposals[network.config.chainId!][proposalIndex];
    //choose how we are going to vote
    //0=against, 1=For, 2=Abstain
    const voteWay = 1;
    const reason = "I just like to change the box to " + NEW_STORE_VALUE;
    const governor = await ethers.getContract("GovernorContract");
    const voteTxResponse = await governor.castVoteWithReason(
        propsalId, voteWay, reason
    );
    await voteTxResponse.wait(1);
    console.log("Voted, now wait for the end of the voting period");

    //we want to get to the end of the voting period
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1);
    }

    console.log("Voting period ended, now we can check the result");

    //check the status
    const proposalState = await governor.state(propsalId);


    console.log("\n\nProposal state: " + proposalStateToText(proposalState));
    /* from contract:
      enum ProposalState {
        Pending,
        Active,
        Canceled,
        Defeated,
        Succeeded,
        Queued,
        Expired,
        Executed
    } */




}

/*
const index = 0; //we get the first element from our proposalsFile (json-file) list

vote(index).then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); //this calls the store function of the box contract with the value 77

*/