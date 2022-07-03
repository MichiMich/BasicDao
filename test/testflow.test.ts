
import { GovernorERC20, GovernanceTokenERC20, TimeLock, Box, GovernanceTokenERC721, GovernorERC721 } from "../typechain-types"
// @ts-ignore
import { deployments, ethers } from "hardhat"
import { assert, expect } from "chai"
import {
    FUNC,
    PROPOSAL_DESCRIPTION,
    argsForFuncExecution,
    VOTING_DELAY,
    VOTING_PERIOD,
    MIN_DELAY,
    governorContractName,
    governanceTokenContractName,
    contractNameWhereActionTakesPlace
} from "../helper-hardhat-config"
import { moveBlocks } from "../utils/move-blocks"
import { moveTime } from "../utils/move-time"

describe("Governor Flow", async () => {
    let governor: any;
    let governanceToken: any;
    // if (governorContractName == "GovernorERC721") {
    //     governor: GovernorERC721;
    //     let governanceToken: GovernanceTokenERC721;
    // }
    // else if (governorContractName == "GovernorERC20") {
    //     governor: GovernorERC20
    //     governanceToken: GovernanceTokenERC20
    // }
    // else {
    //     console.log("Undefined/Unconfigured governorContractName at helper-hardhat-config.ts")
    //     return;
    // }

    let timeLock: TimeLock
    let executingContract: any;
    const voteWay = 1 // for
    const reason = "I lika do da cha cha"
    beforeEach(async () => {
        //await deployments.fixture(["all"])
        governor = await ethers.getContract(governorContractName)
        timeLock = await ethers.getContract("TimeLock")
        governanceToken = await ethers.getContract(governanceTokenContractName)
        executingContract = await ethers.getContract(contractNameWhereActionTakesPlace)
    })

    it("can only be changed through governance", async () => {
        await expect(executingContract.store(55)).to.be.revertedWith("Ownable: caller is not the owner")
    })

    it("proposes, votes, waits, queues, and then executes", async () => {
        // propose
        const encodedFunctionCall = executingContract.interface.encodeFunctionData(FUNC, [argsForFuncExecution])
        const proposeTx = await governor.propose(
            [executingContract.address],
            [0],
            [encodedFunctionCall],
            PROPOSAL_DESCRIPTION
        )

        const proposeReceipt = await proposeTx.wait(1)
        const proposalId = proposeReceipt.events![0].args!.proposalId
        let proposalState = await governor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        await moveBlocks(VOTING_DELAY + 1)
        // vote
        const voteTx = await governor.castVoteWithReason(proposalId, voteWay, reason)
        await voteTx.wait(1)
        proposalState = await governor.state(proposalId)
        assert.equal(proposalState.toString(), "1")
        console.log(`Current Proposal State: ${proposalState}`)
        await moveBlocks(VOTING_PERIOD + 1)

        // queue & execute
        // const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
        const descriptionHash = ethers.utils.id(PROPOSAL_DESCRIPTION)
        const queueTx = await governor.queue([executingContract.address], [0], [encodedFunctionCall], descriptionHash)
        await queueTx.wait(1)
        await moveTime(MIN_DELAY + 1)
        await moveBlocks(1)

        proposalState = await governor.state(proposalId)
        console.log(`Current Proposal State: ${proposalState}`)

        console.log("Executing...")
        console.log
        const exTx = await governor.execute([executingContract.address], [0], [encodedFunctionCall], descriptionHash)
        await exTx.wait(1)
        //console.log((await executingContract.retrieve()).toString())
    })
})