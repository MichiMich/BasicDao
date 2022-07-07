const hre = require('hardhat');
const { deployments, getNamedAccounts } = hre;

(async () => {
    console.log(await deployments.all());
    console.log({ namedAccounts: await getNamedAccounts() });
})();