import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { MIN_DELAY, developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../helpfulScript";

const deployTimelock: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    log("Deploying timelock...");
    const timeLock = await deploy("TimeLock", {
        from: deployer,
        args: [MIN_DELAY, [], []],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    });


    log(`deployed timelock at ${timeLock.address}`);

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(timeLock.address, [MIN_DELAY, [], []], "TimeLock", "contracts/governance_standard/TimeLock.sol:TimeLock")
    }
    else {
        console.log("process.env.ETHERSCAN_API_KEY empty or ", network.name, " not included at developmentChains");
    }


};

export default deployTimelock;