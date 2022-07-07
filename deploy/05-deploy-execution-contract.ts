import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
// @ts-ignore
import { ethers } from "hardhat";
import { contractNameWhereActionTakesPlace } from "../helper-hardhat-config";

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    log("Deploying ", contractNameWhereActionTakesPlace, "...");
    //get tokens deployed by other deployment scripts
    const executionContract = await deploy(contractNameWhereActionTakesPlace, {
        from: deployer,
        args: [],
        log: true,
        //todo add confirmation bit
    })


    //deployer is owner of box
    const timeLock = await ethers.getContract("TimeLock");
    const deployedExecutionContract = await ethers.getContract(contractNameWhereActionTakesPlace);
    const transferOwnerTx = await deployedExecutionContract.transferOwnership(timeLock.address);
    await transferOwnerTx.wait(1);
    log("Timelock is now the owner of the ", contractNameWhereActionTakesPlace);
};

export default deployBox;