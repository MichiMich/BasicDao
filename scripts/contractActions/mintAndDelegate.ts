import { mintAndDelegate, propose, voteSpecific, queue, execute } from "../daoFunctions";
import { governanceTokenContractName } from "../../helper-hardhat-config";

async function mintTokensDelegateVote() {
    // @ts-ignore
    const { voter1, voter2, voter3 } = await hre.ethers.getNamedSigners();
    // @ts-ignore
    const governanceToken = await hre.ethers.getContract(governanceTokenContractName);
    await mintAndDelegate(governanceToken, voter1, voter1.address); //signer, amount, delegate
    await mintAndDelegate(governanceToken, voter2, voter2.address); //signer, amount, delegate
    await mintAndDelegate(governanceToken, voter3, voter3.address); //signer, amount, delegate

    console.log("Votes for voter1: ", await governanceToken.getVotes(voter1.address));
    console.log("Votes for voter2: ", await governanceToken.getVotes(voter2.address));
    console.log("Votes for voter3: ", await governanceToken.getVotes(voter3.address));
}

mintTokensDelegateVote().then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); 