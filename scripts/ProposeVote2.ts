import { propose } from './propose';
import { voteSpecific } from './voteSpecific';
import { queueAndExecute } from './queue-and-execute';
import { NEW_STORE_VALUE, FUNC, PROPOSAL_DESCRIPTION, developmentChains, VOTING_DELAY, proposalsFile } from "../helper-hardhat-config";


async function proposeVoteQueueAndExecute() {
    // @ts-ignore
    const { voter1, voter2, voter3 } = await hre.ethers.getNamedSigners();
    // @ts-ignore
    const governanceToken = await hre.ethers.getContract("GovernanceToken");

    await governanceToken.connect(voter1).mintTokens(1000);
    await governanceToken.connect(voter2).mintTokens(1000);
    await governanceToken.connect(voter3).mintTokens(1000);
    //lets call delegate->create a checkpoint which results in voting power by delegating them (in this case we self delegate)
    await governanceToken.connect(voter1).delegate(voter1.address);
    await governanceToken.connect(voter2).delegate(voter2.address);
    await governanceToken.connect(voter3).delegate(voter3.address);


    await propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION);



    //vote on last set proposal, index 0 = last proposal at proposal.json file
    await voteSpecific(0, 1, "I am for it", voter1);
    await voteSpecific(0, 0, "I am against it", voter2);
    await voteSpecific(0, 2, "I abstain", voter3);

}

proposeVoteQueueAndExecute().then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); //this calls the store function of the box contract with the value 77