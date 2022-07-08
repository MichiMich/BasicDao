
// @ts-ignore
import { ethers, network } from "hardhat";
import { developmentChains, VOTING_DELAY, proposalsFile, argsForFuncExecution, MIN_DELAY, contractNameWhereActionTakesPlace, FUNC, PROPOSAL_DESCRIPTION } from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import { moveTime } from "../utils/move-time";
import * as fs from "fs";
import { proposalStateToText } from "../helpfulScript";
import { hrtime } from "process";


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
    // @ts-ignore
    const { deployer, voter1, voter2, voter3 } = await hre.ethers.getNamedSigners();
    //console.log("deployer: ", deployer);

    console.log("!!!!!\n\n" + "args: ", args + "\n" + "functionToCall: " + functionToCall + "\n" + "Prop. description: " + proposalDescription);

    const governor = await ethers.getContract(governorContractName);
    const executingContract = await ethers.getContract(contractNameWhereActionTakesPlace);
    //encode function data to bytes
    const encodedFunctionCall = executingContract.interface.encodeFunctionData(
        functionToCall,
        args
    ); //encodeFunctionData is a ethers function
    console.log(encodedFunctionCall); //bytes data

    //now we can interact with it
    console.log(`Proposing ${functionToCall} on ${executingContract.address} with ${args}`);
    console.log(`Proposal Description: \n ${proposalDescription}`);
    console.log("\npropose by address: " + deployer.address);

    /*
    const proposeTx = await deployer.sendTransaction({
        to: governor.address,
        data: governor.interface.functions.propose,
        args: [
            [executingContract.address], //list of targets
            [0], //values
            [encodedFunctionCall], //list of encoded function calls in bytes
            proposalDescription
        ]
    });
    const proposeReceipt = await proposeTx.wait(1); //the propose function has some data we later need, like the proposal id which will be emitted by an event
    */


    //sign transaction
    /*
    const sign = await deployer.signTransaction({
        from: deployer.address,
        to: governor.address,
        data: "",
    }).then(console.log);*/

    const proposeTx = await governor.connect(deployer).propose(
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
    //check the status
    const governor = await ethers.getContract(governorContractName);

    const proposalState = await governor.state(propsalId);

    const proposalStateText = proposalStateToText(proposalState);

    console.log("chain: ", network.config.chainId, "read proposalId from file: ", propsalId, "\nProposal state: " + proposalStateText);
    if (!proposalStateText.includes("Active")) {
        console.log("->voting process canceled");
        return;
    }

    console.log("\nvoting...")
    const voteTxResponse = await governor.connect(signer).castVoteWithReason(
        propsalId, voteWay, reason
    );
    await voteTxResponse.wait(1);
    console.log("\nvoted");

    return true;

}

export async function queueWithProposalId(governorContractName: string, _proposalId: any, _proposalDescription: string) {
    // @ts-ignore
    const { network } = hre;

    const args = argsForFuncExecution;
    const executingContract = await ethers.getContract(contractNameWhereActionTakesPlace);

    const encodedFunctionCall = executingContract.interface.encodeFunctionData(FUNC, args);
    //the queue function just looks for the hash of the proposal description
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(_proposalDescription));

    const governor = await ethers.getContract(governorContractName);


    const proposalState = await governor.state(_proposalId);

    if (proposalStateToText(proposalState).includes("Succeeded")) {
        console.log("\n\nProposal state: " + proposalStateToText(proposalState) + " go on with queing it");
    }
    else {
        console.log("\n\nProposal state: " + proposalStateToText(proposalState) + " no queing possible/needed");
        return;
    }


    console.log("Queueing...");

    console.log("targets: ", [executingContract.address], "values: ", [0], "calldatas: ", [encodedFunctionCall], "descriptionHash: ", [descriptionHash]);

    const queueTx = await governor.queue([executingContract.address], [0], [encodedFunctionCall], descriptionHash)
    await queueTx.wait(1);
    console.log("queued")


}



export async function queue(governorContractName: string) {
    // @ts-ignore
    const { network } = hre;

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

    console.log("queued")
    //wait min delay by timeLock needed
    if (developmentChains.includes(network.name)) {
        console.log("now we move blocks and time on development chain")
        await moveTime(MIN_DELAY + 1);
        await moveBlocks(1);
    }

}


export async function executeByProposalId(governorContractName: string, _proposalId: any, _proposalDescription: string) {

    const proposalId = _proposalId;

    //the queue function just looks for the hash of the proposal description
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(_proposalDescription));

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