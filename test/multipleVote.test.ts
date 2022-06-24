import { GovernorContract, GovernanceToken, TimeLock, Box } from "../typechain-types"

// @ts-ignore
import { ethers, network } from "hardhat"
import { assert, expect } from "chai"
import { mintAndDelegate, propose, voteSpecific, queue, execute } from "../scripts/daoFunctions";
import { NEW_STORE_VALUE, FUNC, PROPOSAL_DESCRIPTION, developmentChains, VOTING_DELAY, VOTING_PERIOD, proposalsFile, MIN_DELAY } from "../helper-hardhat-config";

import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"
import { proposalStateToText } from "../helpfulScript"

import { runVoteCycle } from "../scripts/runVoteCycle"

/* 
pretty basic test for one vote cycle, needs to be extended with more votes against,
queuing and executing if failed, check if function is executed on contract after succeeded
*/

describe("Multiple vote test", async () => {
    let governor: GovernorContract
    let governanceToken: GovernanceToken
    let timeLock: TimeLock
    let box: Box

    beforeEach(async () => {
        //await deployments.fixture(["all"])
        governor = await ethers.getContract("GovernorContract")
        timeLock = await ethers.getContract("TimeLock")
        governanceToken = await ethers.getContract("GovernanceToken")
        box = await ethers.getContract("Box")
    })





    it("mint tokens,propose,vote,queue and execute", async () => {

        await runVoteCycle();

    });

    /*this is basically in the runVoteCycle included, some could check if the
    vote does not pass and check for vm revertion*/
    it("mint tokens,propose, fail vote", async () => {

        // @ts-ignore
        const { voter1, voter2, voter3 } = await hre.ethers.getNamedSigners();

        //ToDo: add contract here from which should be minted
        //mint tokens, delegate minted tokens, so they have voting power
        // @ts-ignore
        const governanceToken = await hre.ethers.getContract("GovernanceToken");
        await mintAndDelegate(governanceToken, voter1, voter1.address); //signer, amount, delegate
        await mintAndDelegate(governanceToken, voter2, voter2.address); //signer, amount, delegate
        await mintAndDelegate(governanceToken, voter3, voter3.address); //signer, amount, delegate

        //propose
        let proposalId = await propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION);

        await voteSpecific(0, 1, "I am for it", voter1);
        await voteSpecific(0, 0, "I am against it", voter2);
        await voteSpecific(0, 1, "No", voter3);

        //pass voting period
        //we want to get to the end of the voting period
        if (developmentChains.includes(network.name)) {
            await moveBlocks(VOTING_PERIOD + 1);
        }

        const proposalState = await governor.state(proposalId);

        const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, [NEW_STORE_VALUE]);
        //the queue function just looks for the hash of the proposal description
        const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION));

        if (proposalStateToText(proposalState).includes("Succeeded")) {
            console.log("\n\nProposal state: " + proposalStateToText(proposalState) + " go on with queing it");


            console.log("Queueing...");
            const queueTx = await governor.queue([box.address], [0], [encodedFunctionCall], descriptionHash)
            await queueTx.wait(1);

            console.log("whe have queued it, now we need to move blocks and time")
            //wait min delay by timeLock needed
            if (developmentChains.includes(network.name)) {
                await moveTime(MIN_DELAY + 1);
                await moveBlocks(1);
            }


            await execute();

        }
        else {
            console.log("\n\nProposal state: " + proposalStateToText(proposalState) + " no queing possible/needed");
            await expect(governor.queue([box.address], [0], [encodedFunctionCall], descriptionHash)).to.be.reverted;
            return;
        }

    });



});