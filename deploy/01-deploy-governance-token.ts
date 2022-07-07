import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { governanceTokenContractName } from "../helper-hardhat-config";

const deployGovernanceContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log("Deploying: ", governanceTokenContractName, "...");
    const governanceContract = await deploy(governanceTokenContractName, {
        from: deployer,
        args: [],
        log: true,
        //waitConfirmations: //this stuff used for verfiyng the transaction
    });

    log(`deployed ${governanceTokenContractName} to address ${governanceContract.address}`);

};

/*
const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);

    const tx = await governanceToken.delegate(delegatedAccount);
    await tx.wait(1);
    console.log(`checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`);
}*/

export default deployGovernanceContract;