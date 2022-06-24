import { proposalsFile, NEW_STORE_VALUE, developmentChains, VOTING_PERIOD } from "../../helper-hardhat-config";
import * as fs from "fs";
// @ts-ignore
import { ethers, network } from "hardhat";
import { proposalStateToText } from "../../helpfulScript";

export async function voteSpecific(proposalIndex: number, voteWay: number, reason: string, signer: any) {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    const propsalId = proposals[network.config.chainId!][proposalIndex];
    console.log("read proposalId from file: ", propsalId);
    //choose how we are going to vote
    //0=against, 1=For, 2=Abstain
    const governor = await ethers.getContract("GovernorContract");
    const voteTxResponse = await governor.connect(signer).castVoteWithReason(
        propsalId, voteWay, reason
    );
    await voteTxResponse.wait(1);
    console.log("Voted, now wait for the end of the voting period");

    //check the status
    const proposalState = await governor.state(propsalId);
    console.log("\n\nProposal state: " + proposalStateToText(proposalState));

}

/*
const index = 0; //we get the first element from our proposalsFile (json-file) list

vote(index).then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); //this calls the store function of the box contract with the value 77

*/