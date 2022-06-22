/*this can be used if working on hardhat or localhost network
 for moving blocks in a way we want it to be
*/
import { network } from "hardhat";

export async function moveBlocks(amount: number) {
    console.log("Moving blocks with amount: " + amount);
    //lets mine for our local blockchain
    for (let index = 0; index < amount; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
    }
}

