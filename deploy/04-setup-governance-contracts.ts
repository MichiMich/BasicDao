import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ADDRESS_ZERO, governorContractName } from "../helper-hardhat-config";
// @ts-ignore
import { ethers } from "hardhat";

const setupContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    const timeLock = await ethers.getContract("TimeLock", deployer); //now every function called on it will be called by the deployer
    const governor = await ethers.getContract(governorContractName, deployer);

    log("Setting up roles...");
    //calling public constants from contract
    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executerRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

    const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
    await proposerTx.wait(1);
    //now nobody should have control over the timeLock contract anymore, otherwise it would be a centralized contract/behaviour
    const executorTx = await timeLock.grantRole(executerRole, ADDRESS_ZERO);
    await executorTx.wait(1);
    //currently deployer owns timelockController, defined by constructor of deployer
    const revokeTx = await timeLock.revokeRole(adminRole, deployer); //revoke role, so anything timelock has to do, needs to go through governance
    await revokeTx.wait(1);
    //now nobody can do anything with timelock, without governance happening!


};

export default setupContracts;