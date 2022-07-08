
import { run } from "hardhat"

export function proposalStateToText(proposalState: number) {
    const proposalStatesFromContract = ["Pending", "Active", "Canceled", "Defeated", "Succeeded", "Queued", "Expired", "Executed"];

    if (proposalState < 0 || proposalState >= proposalStatesFromContract.length) {
        return "Unknown propasal state";
    }
    else {
        return proposalStatesFromContract[proposalState];
    }
}

//user input
const readline = require('readline');
export function getUserInput(query: any) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    // @ts-ignore
    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans);
    }))
}



export async function verify(contractAddress: string, args: any[], contractName: string, contractNameAndPath: string) {
    console.log("Verifying contract ", contractName, " at address: ", contractAddress);
    try {
        if (contractNameAndPath === "") {
            await run("verify:verify", {
                address: contractAddress,
                constructorArguments: args
            })
        }
        else {
            console.log("\nAdditional contract parameter for verification: ", contractNameAndPath)
            await run("verify:verify", {
                address: contractAddress,
                constructorArguments: args,
                contract: contractNameAndPath,
            })
        }
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}