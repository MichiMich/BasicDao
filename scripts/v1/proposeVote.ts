import { propose } from './propose';
import { voteSpecific } from './voteSpecific';
import { queueAndExecute } from './queue-and-execute';
import { NEW_STORE_VALUE, FUNC, PROPOSAL_DESCRIPTION, developmentChains, VOTING_DELAY, proposalsFile } from "../helper-hardhat-config";

export async function proposeVote() {
    // @ts-ignore
    const { voter1, voter2, voter3 } = await hre.ethers.getNamedSigners();
    // @ts-ignore
    const governanceToken = await hre.ethers.getContract("GovernanceToken");

    await governanceToken.connect(voter1).mintTokens();
    await governanceToken.connect(voter2).mintTokens();
    await governanceToken.connect(voter3).mintTokens();
    //lets call delegate->create a checkpoint which results in voting power by delegating them (in this case we self delegate)
    await governanceToken.connect(voter1).delegate(voter1.address);
    await governanceToken.connect(voter2).delegate(voter2.address);
    await governanceToken.connect(voter3).delegate(voter3.address);

    //propose, move blocks so vote is active if on development chain
    await propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION);


    //vote on last set proposal, index 0 = last proposal at proposal.json file
    await voteSpecific(0, 1, "I am for it", voter1);
    await voteSpecific(0, 0, "I am against it", voter2);
    //await voteSpecific(0, 2, "I abstain", voter3);
    await voteSpecific(0, 1, "I want it", voter3);

    //pass voting period if on development chain, queue and execute
    await queueAndExecute();


}

proposeVote().then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); //this calls the store function of the box contract with the value 77