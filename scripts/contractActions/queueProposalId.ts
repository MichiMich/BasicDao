import { queueWithProposalId } from "../daoFunctions";
import { governorContractName } from "../../helper-hardhat-config";
import { getUserInput } from "../../helpfulScript";

async function queueProposal() {
    // vote if proposal active, proposalId = last proposalId from proposals.json

    //115607910696426865178090824615312943791097083859998877241289940743504236506929
    let proposalId = await getUserInput("type in the proposalId");
    console.log(proposalId)

    let proposalDescription = JSON.stringify(await getUserInput("type in the proposalDescription"));

    await queueWithProposalId(governorContractName, proposalId, proposalDescription)


}

queueProposal().then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); 