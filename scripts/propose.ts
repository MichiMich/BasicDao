// @ts-ignore
import { ethers, network } from "hardhat";
import { NEW_STORE_VALUE, FUNC, PROPOSAL_DESCRIPTION, developmentChains, VOTING_DELAY, proposalsFile } from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import * as fs from "fs";

export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
    //we want to call the propose function of the governor contract:
    //list of targets we want to call functions on
    //calldata=encoded parameters for function and
    //description
    console.log("!!!!!\n\n" + args + functionToCall + proposalDescription);

    const governor = await ethers.getContract("GovernorContract");
    const box = await ethers.getContract("Box");

    //encode function data to bytes
    const encodedFunctionCall = box.interface.encodeFunctionData(
        functionToCall,
        args
    ); //encodeFunctionData is a ethers function
    console.log(encodedFunctionCall); //bytes data
    //now we can interact with it
    console.log(`Proposing ${functionToCall} on ${box.address} with ${args}`);
    console.log(`Proposal Description: \n ${proposalDescription}`);
    const proposeTx = await governor.propose(
        [box.address], //list of targets
        [0], //values
        [encodedFunctionCall], //list of encoded function calls in bytes
        proposalDescription
    );

    const proposeReceipt = await proposeTx.wait(1); //the propose function has some data we later need, like the proposal id which will be emitted by an event

    //normally the wait until the voting delay will pass. Locally nobody is processing blocks, time is not passing as we want here
    //the way we would expect it, so we will make this happen with our function
    console.log("###network name: " + network.name);
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1);
    }

    /*thats the event emitted by the governorContract if the proposal was created
    emit ProposalCreated(
            proposalId,
            _msgSender(),
            targets,
            values,
            new string[](targets.length),
            calldatas,
            snapshot,
            deadline,
            description
        );
    */
    const proposalId = proposeReceipt.events[0].args.proposalId; //this is what our other scripts (voet,queue) need to know to interact with it
    console.log(`Proposed with proposal ID:\n  ${proposalId}`)

    const proposalState = await governor.state(proposalId);
    const proposalSnapshot = await governor.proposalSnapshot(proposalId);
    const proposalDeadline = await governor.proposalDeadline(proposalId);
    console.log(`Proposal State: \n ${proposalState} \n Proposal Snapshot: \n ${proposalSnapshot} \n Proposal Deadline: \n ${proposalDeadline}`);

    let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    proposals[network.config.chainId!.toString()].push(proposalId.toString());
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals));
}

/*
propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION).then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); //this calls the store function of the box contract with the value 77
*/
