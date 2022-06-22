import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { VOTING_PERIOD, VOTING_DELAY, QUORUM_PERCANTAGE } from "../helper-hardhat-config";

const deployGovernorContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    log("Deploying governorContract...");
    //get tokens deployed by other deployment scripts
    const governanceToken = await get("GovernanceToken");
    const timeLock = await get("TimeLock");

    log("deploying governor")
    const governorContract = await deploy("GovernorContract", {

        from: deployer,
        args: [
            governanceToken.address,
            timeLock.address,
            VOTING_DELAY,
            VOTING_PERIOD,
            QUORUM_PERCANTAGE
        ],
        log: true,
        //waitConfirmations: //this stuff used for verfiyng the transaction, check github of patrick
    });

    log(`deployed governorContract to address ${governorContract.address}`);

};

export default deployGovernorContract;