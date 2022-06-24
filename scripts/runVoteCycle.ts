
import { mintAndDelegate, propose, voteSpecific, queue, execute } from "./daoFunctions";
import { NEW_STORE_VALUE, FUNC, PROPOSAL_DESCRIPTION, developmentChains, VOTING_DELAY, VOTING_PERIOD, proposalsFile } from "../helper-hardhat-config";
// @ts-ignore
import { ethers, network } from "hardhat"
import { proposalStateToText } from "../helpfulScript";
import { moveBlocks } from "../utils/move-blocks";

export async function runVoteCycle() {
    // @ts-ignore
    const { voter1, voter2, voter3 } = await hre.ethers.getNamedSigners();

    //ToDo: add contract here from which should be minted
    //mint tokens, delegate minted tokens, so they have voting power
    // @ts-ignore
    const governanceToken = await hre.ethers.getContract("GovernanceToken");
    await mintAndDelegate(governanceToken, voter1, voter1.address); //signer, amount, delegate
    await mintAndDelegate(governanceToken, voter2, voter2.address); //signer, amount, delegate
    await mintAndDelegate(governanceToken, voter3, voter3.address); //signer, amount, delegate

    console.log("Votes for voter1: ", await governanceToken.getVotes(voter1.address));
    console.log("Votes for voter2: ", await governanceToken.getVotes(voter2.address));
    console.log("Votes for voter3: ", await governanceToken.getVotes(voter3.address));

    //propose
    const proposalId = await propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION);


    await voteSpecific(0, 1, "I am for it", voter1);
    await voteSpecific(0, 0, "I am against it", voter2);
    await voteSpecific(0, 1, "I want it", voter3);



    //pass voting period
    //we want to get to the end of the voting period
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1);
    }

    //pass voting period if on development chain, queue and execute
    //todo check if succeeded, stop if not
    const governor = await ethers.getContract("GovernorContract");
    const proposalState = await governor.state(proposalId);

    if (!proposalStateToText(proposalState).includes("Succeeded")) {
        console.log("Proposal not succeeded, no queuing, executing needed/possible");
        return;
    }

    await queue();

    await execute();



}

// runVoteCycle().then(() => process.exit(0)).catch((error) => {
//     console.log(error)
//     process.exit(1);
// }); //this calls the store function of the box contract with the value 77