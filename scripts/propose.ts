// @ts-ignore
import { ethers } from "hardhat";
import { NEW_STORE_VALUE, FUNC, PROPOSAL_DESCRIPTION } from "../helper-hardhat-config";

export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
    //we want to call the propose function of the governor contract:
    //list of targets we want to call functions on
    //calldata=encoded parameters for function and
    //description
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

    await proposeTx.wait(1)

    //normally the wait until the voting delay will pass. Locally blocks are not processed
    //the way we would expect it, so we will pass this


}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION).then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); //this calls the store function of the box contract with the value 77