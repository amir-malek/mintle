/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('@nomiclabs/hardhat-ethers');
const config = require('config');

module.exports = {
  solidity: '0.8.4',
  paths: {
    sources: './server/contracts',
    artifacts: './server/artifacts',
    cache: './server/cache',
    scripts: './server/scripts',
  },
  defaultNetwork: 'mumbai',
  networks: {
    mumbai: {
      url: config.get('web3.alchemy.mumbai.apiUrl'),
      accounts: [`0x${config.get('web3.wallet.pvKey')}`],
    },
    sepolia: {
      url: config.get('web3.alchemy.sepolia.apiUrl'),
      accounts: [`0x${config.get('web3.wallet.pvKey')}`],
    },
  },
};