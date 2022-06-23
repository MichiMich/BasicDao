import { GovernorContract, GovernanceToken, TimeLock, Box } from "../typechain-types"
// @ts-ignore
import { ethers } from "hardhat"
import { assert, expect } from "chai"
import {
    FUNC,
    PROPOSAL_DESCRIPTION,
    NEW_STORE_VALUE,
    VOTING_DELAY,
    VOTING_PERIOD,
    MIN_DELAY,
} from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"
import { proposalStateToText } from "../helpfulScript"


describe("Multiple vote test", async () => {
    let governor: GovernorContract
    let governanceToken: GovernanceToken
    let timeLock: TimeLock
    let box: Box
    const voteWay = 1 // for
    const reason = "I lika do da cha cha"
    let proposalId = 0;

    beforeEach(async () => {
        //await deployments.fixture(["all"])
        governor = await ethers.getContract("GovernorContract")
        timeLock = await ethers.getContract("TimeLock")
        governanceToken = await ethers.getContract("GovernanceToken")
        box = await ethers.getContract("Box")
    })


    it("propose and vote", async () => {

        //dont want to re run everything
        //get signers defined at hardhat.config named accounts
        // @ts-ignore
        const { voter1, voter2 } = await hre.ethers.getNamedSigners();

        console.log("mint tokens, vote")
        //lets get some tokens
        await governanceToken.connect(voter1).mintTokens(1000);
        await governanceToken.connect(voter2).mintTokens(1000);
        //lets call delegate->create a checkpoint which results in voting power by delegating them (in this case we self delegate)
        await governanceToken.connect(voter1).delegate(voter1.address);
        await governanceToken.connect(voter2).delegate(voter2.address);

        await getCheckpointsAndVotingPower("voter1", voter1.address);
        await getCheckpointsAndVotingPower("voter2", voter2.address);


        // propose
        const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, [NEW_STORE_VALUE])
        const proposeTx = await governor.propose(
            [box.address],
            [0],
            [encodedFunctionCall],
            PROPOSAL_DESCRIPTION
        )

        const proposeReceipt = await proposeTx.wait(1)
        proposalId = proposeReceipt.events![0].args!.proposalId
        let proposalState = await governor.state(proposalId)
        console.log("proposalState: ", proposalState, ": ", proposalStateToText(proposalState));

        await moveBlocks(VOTING_DELAY + 1)

        proposalState = await governor.state(proposalId)
        console.log("proposalState: ", proposalState, ": ", proposalStateToText(proposalState));


        // vote
        await vote(voter1, proposalId, 1, reason);
        await vote(voter2, proposalId, 0, "no chachacha");

        console.log("Has voted voter1: ", await governor.hasVoted(proposalId, voter1.address));
        console.log("Has voted voter2: ", await governor.hasVoted(proposalId, voter2.address));

        // @ts-ignore
        console.log("total proposalVotes: \n\n", await governor.proposalVotes(proposalId))

    });





    it("fetch some contract data", async () => {
        // @ts-ignore
        const { voter1, voter2 } = await hre.ethers.getNamedSigners();
        console.log("Has voted voter1: ", await governor.hasVoted(proposalId, voter1.address));
        console.log("Has voted voter2: ", await governor.hasVoted(proposalId, voter2.address));

        // @ts-ignore
        console.log("total proposalVotes: \n\n", await governor.proposalVotes(proposalId))
    });


    it("mint tokens, vote", async () => {
        //get signers defined at hardhat.config named accounts
        // @ts-ignore
        const { voter1, voter2 } = await hre.ethers.getNamedSigners();
        console.log("mint tokens, vote")
        //lets get some tokens
        await governanceToken.connect(voter1).mintTokens(1000);
        await governanceToken.connect(voter2).mintTokens(1000);
        //lets call delegate->create a checkpoint which results in voting power by delegating them (in this case we self delegate)
        await governanceToken.connect(voter1).delegate(voter1.address);
        await governanceToken.connect(voter2).delegate(voter2.address);

        await getCheckpointsAndVotingPower("voter1", voter1.address);
        await getCheckpointsAndVotingPower("voter2", voter2.address);


        // propose
        const encodedFunctionCall = box.interface.encodeFunctionData(FUNC, [NEW_STORE_VALUE])
        const proposeTx = await governor.propose(
            [box.address],
            [0],
            [encodedFunctionCall],
            PROPOSAL_DESCRIPTION
        )

        const proposeReceipt = await proposeTx.wait(1)
        const proposalId = proposeReceipt.events![0].args!.proposalId
        let proposalState = await governor.state(proposalId)
        console.log("proposalState: ", proposalState, ": ", proposalStateToText(proposalState));

        await moveBlocks(VOTING_DELAY + 1)

        proposalState = await governor.state(proposalId)
        console.log("proposalState: ", proposalState, ": ", proposalStateToText(proposalState));

        // @ts-ignore
        //console.log("total vote supply: \n\n", await governor._getTotalSupply())
        // @ts-ignore
        console.log("total past supply: \n\n", await governor.proposalVotes(proposalId))

        // vote
        await vote(voter1, proposalId, 1, reason);
        await vote(voter2, proposalId, 0, "no chachacha");



        // @ts-ignore
        proposalState = await governor.state(proposalId)
        assert.equal(proposalState.toString(), "1")
        console.log("proposalState: ", proposalState, ": ", proposalStateToText(proposalState));
        await moveBlocks(VOTING_PERIOD + 1)



        //result of proposal
        proposalState = await governor.state(proposalId)
        console.log("proposalState: ", proposalState, ": ", proposalStateToText(proposalState));

        if (proposalStateToText(proposalState).includes("Defeated")) {
            console.log("proposal was defeated, no need to queue and execute it")
            return;
        }

        //get current proposal state, how much are for and how much against it

        // queue & execute
        console.log("\nQueue")
        const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION)
        const queueTx = await governor.queue([box.address], [0], [encodedFunctionCall], descriptionHash)
        await queueTx.wait(1)
        await moveTime(MIN_DELAY + 1)
        await moveBlocks(1)

        proposalState = await governor.state(proposalId)
        console.log("proposalState: ", proposalState, ": ", proposalStateToText(proposalState));

        console.log("\nExecuting...")
        const exTx = await governor.execute([box.address], [0], [encodedFunctionCall], descriptionHash)
        await exTx.wait(1)
        console.log((await box.retrieve()).toString())





    });

    const vote = async (account: any, proposalId: any, voteWay: number, reason: string) => {
        const voteTx = await governor.connect(account).castVoteWithReason(proposalId, voteWay, reason)
        const voteReceipt = await voteTx.wait(1);
        // @ts-ignore
        console.log("\nVoteCastWithParams event: \nVoter: ", voteReceipt.events[0].args!.voter, " support: ", voteReceipt.events[0].args!.support, " weight: ", voteReceipt.events[0].args!.weight.toString());// " reason: ", voteReceipt.events[0].args!.reason)
    }

    const getCheckpointsAndVotingPower = async (name: string, account: string) => {
        const governanceToken = await ethers.getContract("GovernanceToken");
        const votes = await governanceToken.getVotes(account);
        console.log("\nname: " + name + " address: " + account + "\ntoken balance: " + await governanceToken.balanceOf(account) + "\ncheckpoints: " + await governanceToken.numCheckpoints(account) + "\nvotes: " + votes.toString());
    }
});