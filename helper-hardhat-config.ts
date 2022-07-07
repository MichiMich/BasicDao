export const MIN_DELAY = 3600; //one hour
export const VOTING_PERIOD = 5; //in blocks
export const VOTING_DELAY = 1; //in blocks
export const QUORUM_PERCANTAGE = 4;
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

/*configuration for wanted interactions of proposal and executed functions if succeeded (start)*/


/* configuration 1 - NftCollection.sol

This calls the "addCollection" function of the contract NftCollection.sol the contract address "0xaf6344bc7bc538dcf7179c36fc57ccae302c1bbb" and the name "OCAA" if 
the proposal succeeds (addCollection("0xaf6344bc7bc538dcf7179c36fc57ccae302c1bbb","OCAA"))*/
export const contractNameWhereActionTakesPlace = "NftCollection";
export const argsForFuncExecution = ["0xaf6344bc7bc538dcf7179c36fc57ccae302c1bbb", "OCAA"];
export const FUNC = "addCollection";
export const PROPOSAL_DESCRIPTION = "Proposal #1 add ocaa to nft collection";

/* configuration 2 - Box.sol

This calls the "store" function with the value 77 (store(77)) of the contract Box.sol if the proposal succeeded
export const contractNameWhereActionTakesPlace = "Box";
export const argsForFuncExecution = [77];
export const FUNC = "store";
export const PROPOSAL_DESCRIPTION = "Proposal #1: Store 77 in the Box!";
*/


/*configuration for wanted interactions of proposal and executed functions if succeeded (end)*/

export const developmentChains = ["hardhat", "localhost"];
export const proposalsFile = "proposals.json";
export const governorContractName = "GovernorERC721";//"GovernorERC20";"GovernorERC721";
export const governanceTokenContractName = "GovernanceTokenERC721";//"GovernanceTokenERC20"; //"GovernanceTokenERC721";