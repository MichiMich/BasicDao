import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { VOTING_PERIOD, VOTING_DELAY, QUORUM_PERCANTAGE, governorContractName, governanceTokenContractName, networkConfig, developmentChains } from "../helper-hardhat-config";
import { verify } from "../helpfulScript";

const deployGovernorContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    // @ts-ignore
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();
    log("Deploying governorContract:", governorContractName, "...");
    //get tokens deployed by other deployment scripts
    const governanceToken = await get(governanceTokenContractName);


    const timeLock = await get("TimeLock");

    log("deploying governor ", governorContractName)
    const governorContract = await deploy(governorContractName, {

        from: deployer,
        args: [
            governanceToken.address,
            timeLock.address,
            VOTING_DELAY,
            VOTING_PERIOD,
            QUORUM_PERCANTAGE
        ],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
    });

    log(`deployed governorContract to address ${governorContract.address}`);
    //verify
    // let contractParameterForVerify = "";
    // if (governorContractName.includes("ERC20")) {
    //     contractParameterForVerify = governorContractName + ".sol:Governor"
    // }
    // else if (governorContractName.includes("ERC721")) {

    // }
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(governorContract.address, [governanceToken.address,
        timeLock.address,
            VOTING_DELAY,
            VOTING_PERIOD,
            QUORUM_PERCANTAGE], governorContractName, ("contracts/governance_standard/" + governorContractName + ".sol:" + governorContractName))
    }
    else {
        console.log("process.env.ETHERSCAN_API_KEY empty or ", network.name, " not included at developmentChains");
    }
};

export default deployGovernorContract;
