/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('@nomiclabs/hardhat-ethers');
const config = require('config');

module.exports = {
  solidity: '0.8.4',
  paths: {
    sources: "./server/contracts",
    artifacts: "./server/artifacts",
    cache: "./server/cache"
  }
  // defaultNetwork: 'sepolia',
  // networks: {
  //   hardhat: {},
  //   sepolia: {
  //     url: config.get('web3.alchemy.apiKey'),
  //     accounts: [`0x${config.get('web3.metamask.pvKey')}`],
  //   },
  // },
};
