const hre = require("hardhat");
const { ethers } = require("hardhat");


async function main() {


    //get available accounts from hardhat
    let accounts = await hre.ethers.getSigners();
    //deploy contract
    const GovernanceToken = await hre.ethers.getContractFactory("GovernanceTokenERC721");
    const governanceToken = await GovernanceToken.deploy(); //mint price set to 1e15 = 1 finney = 0.001 eth
    await governanceToken.deployed();

    console.log("governanceToken deployed to:", governanceToken.address);
    /*
    let tokenURI;
    for (let i = 0; i < 2; i++) {
        //mint some tokens
        const mintTx = await governanceToken.mint();
        await mintTx.wait(1);
        tokenURI = await governanceToken.tokenURI(i);
        console.log("tokenURI: ", tokenURI, "\n");
    }
    */

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });