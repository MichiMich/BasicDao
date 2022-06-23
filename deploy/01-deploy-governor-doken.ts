import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
// @ts-ignore
import { ethers } from "hardhat";

const deployGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    //get signers defined at hardhat.config named accounts
    const { voter1, voter2 } = await hre.ethers.getNamedSigners();

    log("Deploying Governance Token...");
    const governanceToken = await deploy("GovernanceToken", {
        from: deployer,
        args: [],
        log: true,
        //waitConfirmations: //this stuff used for verfiyng the transaction
    });

    log(`deployed governance token to address ${governanceToken.address}`);


    const governance = await ethers.getContract("GovernanceToken"); //now every function called on it will be called by the deployer


    //lets get some tokens
    await governance.connect(voter2).mintTokens(1000);
    //lets create a checkpoint which results in voting power by delegating them (in this case we self delegate)
    await governance.connect(voter2).delegate(voter2.address);
    // await delegate(governanceToken.address, voter2.address);
    await governance.connect(voter1).mintTokens(1000);
    await governance.connect(voter1).delegate(voter1.address);

    await getCheckpointsAndVotingPower("voter1", voter1.address);

    await getCheckpointsAndVotingPower("voter2", voter2.address);


    // console.log("deployer ", "votes: \n", await governance.getVotes(deployer))

    // console.log("voter1 ", "votes: \n", await governance.getVotes(voter1.address))


    // console.log("\nMax supply: " + (await governance.totalSupply()).toString());

    //move voting power by transfering tokens


    //a transfer moves tokens and triggers the _moveVotingPower, which delagets voting power
    //which triggers the _moveVotingPower() and this trigggers the _writeCheckpoint() with the
    //updated amount
    //the token transfer updates the voting power of the who is transferring the tokens, not the one who gets them
    // const transferTokens = await governance.transfer(voter1.address, 100, { from: deployer });
    // const transferTx = await transferTokens.wait(1);

    // await delegate(governanceToken.address, voter1.address)

    // //now give transfered tokens of voter voting power
    // // await governance.delegate(voter1.address);

    // decodeDelegateVotesChangedEvent(transferTx.events[1]);




};


const getCheckpointsAndVotingPower = async (name: string, account: string) => {
    const governanceToken = await ethers.getContract("GovernanceToken");
    const votes = await governanceToken.getVotes(account);
    console.log("\nname: " + name + " address: " + account + "\ntoken balance: " + await governanceToken.balanceOf(account) + "\ncheckpoints: " + await governanceToken.numCheckpoints(account) + "\nvotes: " + votes.toString());
}



const decodeDelegateVotesChangedEvent = (event: any) => {
    console.log("\nDelegateVotesChanged: dest: ", event.args[0], " oldWeight: ", event.args[1].toString(), " newWeigth: ", event.args[2].toString());
}

const getVotes = async (governanceTokenAddress: string, account: string) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);

    await delegate(governanceTokenAddress, account);
    console.log("Votes for " + account + ": " + await governanceToken.getVotes(account));
}

const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);

    const tx = await governanceToken.delegate(delegatedAccount);
    await tx.wait(1);
    console.log(`checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`);

}

export default deployGovernanceToken;