import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
// @ts-ignore
import { ethers } from "hardhat";
import { contractNameWhereActionTakesPlace, developmentChains, networkConfig } from "../helper-hardhat-config";
import { verify } from "../helpfulScript";

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log, get } = deployments;
    const { deployer, voter1 } = await getNamedAccounts();
    log("Deploying ", contractNameWhereActionTakesPlace, "...");
    //get tokens deployed by other deployment scripts
    const executionContract = await deploy(contractNameWhereActionTakesPlace, {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    })

    log(`deployed ${contractNameWhereActionTakesPlace} at ${executionContract.address}`);
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(executionContract.address, [], contractNameWhereActionTakesPlace, "")
    }
    else {
        console.log("process.env.ETHERSCAN_API_KEY empty or ", network.name, " not included at developmentChains");
    }

    const timeLock = await ethers.getContract("TimeLock");
    const deployedExecutionContract = await ethers.getContract(contractNameWhereActionTakesPlace);
    const transferOwnerTx = await deployedExecutionContract.transferOwnership(timeLock.address);
    await transferOwnerTx.wait(1);
    log("Timelock is now the owner of the ", contractNameWhereActionTakesPlace);
};

export default deployBox;