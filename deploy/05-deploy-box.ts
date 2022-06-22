import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
// @ts-ignore
import { ethers } from "hardhat";

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    log("Deploying Box...");
    //get tokens deployed by other deployment scripts
    const box = await deploy("Box", {
        from: deployer,
        args: [],
        log: true,
        //todo add confirmation bit
    })
    //deployer is owner of box
    const timeLock = await ethers.getContract("TimeLock");
    const boxContract = await ethers.getContractAt("Box", box.address);
    const transferOwnerTx = await boxContract.transferOwnership(timeLock.address);
    await transferOwnerTx.wait(1);
    log("Timelock is now the owner of the boxContract")
};

export default deployBox;