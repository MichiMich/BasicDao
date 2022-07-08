import { propose } from "../daoFunctions";
import { argsForFuncExecution, FUNC, governorContractName } from "../../helper-hardhat-config";
import { getUserInput } from "../../helpfulScript";

async function proposeOnContract() {
    // @ts-ignore
    const governorContract = await hre.ethers.getContract(governorContractName);

    let proposalDescription = await getUserInput("type in the proposal description:")

    console.log("\nPropose on ", governorContractName, " at: ", governorContract.address, " description: ", proposalDescription);
    //propose
    const proposalId = await propose(governorContractName, argsForFuncExecution, FUNC, JSON.stringify(proposalDescription)
    );
    console.log("Proposal id: ", proposalId);
}

proposeOnContract().then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); 