import { FUNC, PROPOSAL_DESCRIPTION, NEW_STORE_VALUE, developmentChains, MIN_DELAY } from "../helper-hardhat-config";
import * as fs from "fs";
// @ts-ignore
import { ethers, network } from "hardhat";
import { moveTime } from "../utils/move-time";
import { moveBlocks } from "../utils/move-blocks";

export async function queueAndExecute(proposalIndex: number) {
    const args = [NEW_STORE_VALUE];
    const box = await ethers.getContract("Box");
    const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, args);
    //the queue function just looks for the hash of the proposal description
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION));

    const governor = await ethers.getContract("GovernorContract");
    console.log("Queueing...");
    const queueTx = await governor.queue([box.address], [0], [encodedFunctionCall], descriptionHash)
    await queueTx.wait(1);

    console.log("whe have queued it, now we need to move blocks and time")
    //wait min delay by timeLock needed
    if (developmentChains.includes(network.name)) {
        await moveTime(MIN_DELAY + 1);
        await moveBlocks(1);
    }

    console.log("Executing...");
    const executeTx = await governor.execute(
        [box.address],
        [0],
        [encodedFunctionCall],
        descriptionHash);

    await executeTx.wait(1);

    const boxNewValue = await box.retrieve();
    console.log(`Box new value: ${boxNewValue.toString()}`);


}


/*

const index = 0; //we get the first element from our proposalsFile (json-file) list

queueAndExecute(index).then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); //this calls the store function of the box contract with the value 77

*/