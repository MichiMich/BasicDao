import { queue } from "../daoFunctions";
import { governorContractName } from "../../helper-hardhat-config";

async function queueProposal() {
    // vote if proposal active, proposalId = last proposalId from proposals.json
    await queue(governorContractName)
}

queueProposal().then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); 