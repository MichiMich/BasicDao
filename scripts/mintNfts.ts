import { proposalsFile, governanceTokenContractName } from "../helper-hardhat-config";
// @ts-ignore
import { ethers, network } from "hardhat"
import * as fs from "fs";
import { proposalStateToText } from "../helpfulScript";

async function mintSomeNfts() {

    const governanceNft = await ethers.getContract(governanceTokenContractName)


    // @ts-ignore
    const { voter1, voter2, voter3 } = await hre.ethers.getNamedSigners();

    //mint some tokens
    console.log("mint nft")
    const mintTx = await governanceNft.mint();
    await mintTx.wait(1);

    const tokenURI = await governanceNft.tokenURI(1);

    console.log("tokenURI: ", tokenURI);

}

mintSomeNfts().then(() => process.exit(0)).catch((error) => {
    console.log(error)
    process.exit(1);
}); //this calls the store function of the box contract with the value 77