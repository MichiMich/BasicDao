import { TimeLock } from "../typechain-types"

// @ts-ignore
import { ethers, network } from "hardhat"
import { assert, expect } from "chai"
import { mintAndDelegate, propose, voteSpecific, queue, execute } from "../scripts/daoFunctions";
import { contractNameWhereActionTakesPlace, argsForFuncExecution, FUNC, PROPOSAL_DESCRIPTION, developmentChains, VOTING_DELAY, VOTING_PERIOD, proposalsFile, MIN_DELAY } from "../helper-hardhat-config";

import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"
import { proposalStateToText } from "../helpfulScript"

import { runVoteCycleNft } from "../scripts/runVoteCycle"
import {
    governorContractName,
    governanceTokenContractName
} from "../helper-hardhat-config"
/* 
pretty basic test for one vote cycle, needs to be extended with more votes against,
queuing and executing if failed, check if function is executed on contract after succeeded
*/

describe("Multiple vote test", async () => {
    let governor: any;
    let governanceToken: any;
    let timeLock: TimeLock
    let executingContract: any;

    beforeEach(async () => {
        //await deployments.fixture(["all"])
        governor = await ethers.getContract(governorContractName)
        timeLock = await ethers.getContract("TimeLock")
        governanceToken = await ethers.getContract(governanceTokenContractName)
        executingContract = await ethers.getContract(contractNameWhereActionTakesPlace)
    })

    it("mint tokens,propose,vote,queue and execute", async () => {

        await runVoteCycleNft();

    });

    /*this is basically in the runVoteCycle included, some could check if the
    vote does not pass and check for vm revertion*/
    it("mint tokens,propose, succeed vote, queue and execute", async () => {

        // @ts-ignore
        const { voter1, voter2, voter3 } = await hre.ethers.getNamedSigners();

        //ToDo: add contract here from which should be minted
        //mint tokens, delegate minted tokens, so they have voting power
        // @ts-ignore
        const governanceToken = await hre.ethers.getContract(governanceTokenContractName);
        await mintAndDelegate(governanceToken, voter1, voter1.address); //signer, amount, delegate
        await mintAndDelegate(governanceToken, voter2, voter2.address); //signer, amount, delegate
        await mintAndDelegate(governanceToken, voter3, voter3.address); //signer, amount, delegate

        //propose
        let proposalId = await propose(governorContractName, argsForFuncExecution, FUNC, PROPOSAL_DESCRIPTION);

        await voteSpecific(governorContractName, 0, 1, "I am for it", voter1);
        await voteSpecific(governorContractName, 0, 0, "I am against it", voter2);
        await voteSpecific(governorContractName, 0, 1, "No", voter3);

        //pass voting period
        //we want to get to the end of the voting period
        if (developmentChains.includes(network.name)) {
            await moveBlocks(VOTING_PERIOD + 1);
        }

        const proposalState = await governor.state(proposalId);

        const encodedFunctionCall = executingContract.interface.encodeFunctionData(FUNC, argsForFuncExecution);

        //the queue function just looks for the hash of the proposal description
        const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION));

        if (proposalStateToText(proposalState).includes("Succeeded")) {
            console.log("\n\nProposal state: " + proposalStateToText(proposalState) + " go on with queing it");


            console.log("Queueing...");
            const queueTx = await governor.queue([executingContract.address], [0], [encodedFunctionCall], descriptionHash)
            await queueTx.wait(1);

            console.log("whe have queued it, now we need to move blocks and time")
            //wait min delay by timeLock needed
            if (developmentChains.includes(network.name)) {
                await moveTime(MIN_DELAY + 1);
                await moveBlocks(1);
            }


            await execute(governorContractName);

        }
        else {
            console.log("\n\nProposal state: " + proposalStateToText(proposalState) + " no queing possible/needed");
            await expect(governor.queue([executingContract.address], [0], [encodedFunctionCall], descriptionHash)).to.be.reverted;
            return;
        }

        //ToDo this needs to be adapted, on what to call depending on helper-hardhat-config contract and func
        //box store, we call retrieve, nft collection, we call isPartOfCollection
        console.log("Is  part of collection: ", await executingContract.isPartOfCollection("0xaf6344bc7bc538dcf7179c36fc57ccae302c1bbb"))

    });



});