import { voteSpecific } from "../daoFunctions";
import { governorContractName } from "../../helper-hardhat-config";

async function voteOnProposal() {
    // @ts-ignore
    const { voter1, voter2, voter3 } = await hre.ethers.getNamedSigners();
    // vote if proposal active, proposalId = last proposalId from proposals.json
    await voteSpecific(governorContractName, 0, 1, "I am for it", voter1);
    await voteSpecific(governorContractName, 0, 0, "I am against it", voter2);
    await voteSpecific(governorContractName, 0, 1, "I want it", voter3);
}

voteOnProposal().then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); 