
import { mintAndDelegate, propose, voteSpecific, queue, execute } from "./daoFunctions";
import { NEW_STORE_VALUE, FUNC, PROPOSAL_DESCRIPTION, developmentChains, VOTING_DELAY, proposalsFile } from "../helper-hardhat-config";

async function proposeVoteQueueAndExecute() {
    // @ts-ignore
    const { voter1, voter2, voter3 } = await hre.ethers.getNamedSigners();

    //ToDo: add contract here from which should be minted
    //mint tokens, delegate minted tokens, so they have voting power
    await mintAndDelegate(voter1, 1, voter1.address); //signer, amount, delegate
    await mintAndDelegate(voter2, 1, voter2.address); //signer, amount, delegate
    await mintAndDelegate(voter3, 1, voter3.address); //signer, amount, delegate

    //propose
    await propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION);


    await voteSpecific(0, 1, "I am for it", voter1);
    await voteSpecific(0, 0, "I am against it", voter2);
    await voteSpecific(0, 0, "I want it", voter3);

    //pass voting period if on development chain, queue and execute
    //todo check if succeeded, stop if not
    await queue();

    await execute();



}

proposeVoteQueueAndExecute().then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); //this calls the store function of the box contract with the value 77