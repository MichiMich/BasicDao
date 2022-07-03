
// @ts-ignore
import { ethers, network } from "hardhat";
import { developmentChains, VOTING_DELAY, proposalsFile, argsForFuncExecution, MIN_DELAY, contractNameWhereActionTakesPlace, FUNC, PROPOSAL_DESCRIPTION } from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import { moveTime } from "../utils/move-time";
import * as fs from "fs";
import { proposalStateToText } from "../helpfulScript";


export async function mintAndDelegate(contract: any, signer: any, delegateeAddress: any) {
    await contract.connect(signer).mint();
    //lets call delegate->create a checkpoint which results in voting power by delegating them (in this case we self delegate)
    await contract.connect(signer).delegate(delegateeAddress);
}

export async function propose(governorContractName: string, args: any[], functionToCall: string, proposalDescription: string) {
    //we want to call the propose function of the governor contract:
    //list of targets we want to call functions on
    //calldata=encoded parameters for function and
    //description
    console.log("!!!!!\n\n" + "args: ", args + "\n" + "functionToCall: " + functionToCall + "\n" + "Prop. description: " + proposalDescription);

    const governor = await ethers.getContract(governorContractName);
    const executingContract = await ethers.getContract(contractNameWhereActionTakesPlace);

    //encode function data to bytes
    const encodedFunctionCall = executingContract.interface.encodeFunctionData(
        functionToCall,
        args
    ); //encodeFunctionData is a ethers function
    //console.log(encodedFunctionCall); //bytes data

    //now we can interact with it
    console.log(`Proposing ${functionToCall} on ${executingContract.address} with ${args}`);
    console.log(`Proposal Description: \n ${proposalDescription}`);
    const proposeTx = await governor.propose(
        [executingContract.address], //list of targets
        [0], //values
        [encodedFunctionCall], //list of encoded function calls in bytes
        proposalDescription
    );

    const proposeReceipt = await proposeTx.wait(1); //the propose function has some data we later need, like the proposal id which will be emitted by an event

    //normally the wait until the voting delay will pass. Locally nobody is processing blocks, time is not passing as we want here
    //the way we would expect it, so we will make this happen with our function
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

    console.log(`Proposal State: \n ${proposalStateToText(proposalState)} \n Proposal Snapshot: \n ${proposalSnapshot} \n Proposal Deadline: \n ${proposalDeadline}`);

    let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    proposals[network.config.chainId!.toString()].push(proposalId.toString());
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals));

    return (proposalId);

}


export async function voteSpecific(governorContractName: string, proposalIndex: number, voteWay: number, reason: string, signer: any) {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    const propsalId = proposals[network.config.chainId!][proposalIndex];
    console.log("read proposalId from file: ", propsalId);
    //choose how we are going to vote
    const governor = await ethers.getContract(governorContractName);
    const voteTxResponse = await governor.connect(signer).castVoteWithReason(
        propsalId, voteWay, reason
    );
    await voteTxResponse.wait(1);
    console.log("Voted, now wait for the end of the voting period");

    //check the status
    const proposalState = await governor.state(propsalId);
    console.log("\n\nProposal state: " + proposalStateToText(proposalState));
}

export async function queue(governorContractName: string) {

    const args = argsForFuncExecution;
    const executingContract = await ethers.getContract(contractNameWhereActionTakesPlace);
    console.log("###\n\n encodeFunctionData")
    const encodedFunctionCall = executingContract.interface.encodeFunctionData(FUNC, args);
    //the queue function just looks for the hash of the proposal description
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION));

    const governor = await ethers.getContract(governorContractName);


    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    const proposalId = proposals[network.config.chainId!][0];
    const proposalState = await governor.state(proposalId);

    if (proposalStateToText(proposalState).includes("Succeeded")) {
        console.log("\n\nProposal state: " + proposalStateToText(proposalState) + " go on with queing it");
    }
    else {
        console.log("\n\nProposal state: " + proposalStateToText(proposalState) + " no queing possible/needed");
        return;
    }


    console.log("Queueing...");
    const queueTx = await governor.queue([executingContract.address], [0], [encodedFunctionCall], descriptionHash)
    await queueTx.wait(1);

    console.log("whe have queued it, now we need to move blocks and time")
    //wait min delay by timeLock needed
    if (developmentChains.includes(network.name)) {
        await moveTime(MIN_DELAY + 1);
        await moveBlocks(1);
    }

}


export async function execute(governorContractName: string) {

    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    const proposalId = proposals[network.config.chainId!][0];
    console.log("read proposalId from file: ", proposalId);
    //the queue function just looks for the hash of the proposal description
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION));

    const governor = await ethers.getContract(governorContractName);

    const args = argsForFuncExecution;
    const executingContract = await ethers.getContract(contractNameWhereActionTakesPlace);
    const encodedFunctionCall = executingContract.interface.encodeFunctionData(FUNC, args);

    const proposalState = await governor.state(proposalId);
    console.log("ProposalState at execute: " + proposalState);

    //is there no update after queued? can it only be queued if if succeeded?
    // if (!proposalStateToText(proposalState).includes("Succeeded")) {
    //     console.log("\n\nProposal state: " + proposalStateToText(proposalState) + " no executing possible/needed");
    //     return;
    // }

    console.log("Executing...");
    const executeTx = await governor.execute(
        [executingContract.address], //target/contract, at which the encodedFunctionCall will be called
        [0], //value 
        [encodedFunctionCall], //function which will be called by timelockController
        descriptionHash);

    await executeTx.wait(1);

    /*
    //now we have executed our function call by the timelockController (the retrieve function shows the new
    //value of the box contract if the vote has passed, otherwise it shows the previous value)
    const boxNewValue = await executingContract.retrieve();
    console.log(`Box new value: ${boxNewValue.toString()}`);
    */

}