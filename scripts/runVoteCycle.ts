import { propose } from './propose';
import { vote } from './vote';
import { queueAndExecute } from './queue-and-execute';
import { NEW_STORE_VALUE, FUNC, PROPOSAL_DESCRIPTION, developmentChains, VOTING_DELAY, proposalsFile } from "../helper-hardhat-config";


async function proposeVoteQueueAndExecute() {
    await propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION);
    //vote on last set proposal, index 0 = last proposal at proposal.json file
    await vote(0);
    //queueAndExecute on last set proposal, index 0 = last proposal at proposal.json file
    await queueAndExecute(0);

}

proposeVoteQueueAndExecute().then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); //this calls the store function of the box contract with the value 77