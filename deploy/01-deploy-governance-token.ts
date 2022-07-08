import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { networkConfig, governanceTokenContractName, developmentChains } from "../helper-hardhat-config";
import { verify } from "../helpfulScript";

const deployGovernanceContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log("Deploying: ", governanceTokenContractName, "...");
    const governanceContract = await deploy(governanceTokenContractName, {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    });

    log(`deployed ${governanceTokenContractName} to address ${governanceContract.address}`);
    console.log(developmentChains.includes(network.name))
    console.log(process.env.ETHERSCAN_API_KEY)
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(governanceContract.address, [], governanceTokenContractName, "")
    }
    else {
        console.log("process.env.ETHERSCAN_API_KEY empty or ", network.name, " not included at developmentChains");
    }
};

/*
const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress);

    const tx = await governanceToken.delegate(delegatedAccount);
    await tx.wait(1);
    console.log(`checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`);
}*/

export default deployGovernanceContract;