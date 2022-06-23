import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log("Deploying Governance Token...");
    const governanceToken = await deploy("GovernanceToken", {
        from: deployer,
        args: [],
        log: true,
        //waitConfirmations: //this stuff used for verfiyng the transaction
    });

    log(`deployed GovernanceToken to address ${governanceToken.address}`);

};

/*
const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);

    const tx = await governanceToken.delegate(delegatedAccount);
    await tx.wait(1);
    console.log(`checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`);
}*/

export default deployGovernanceToken;