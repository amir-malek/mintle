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
      url: config.get('web3.alchemy.apiUrl'),
      accounts: [`0x${config.get('web3.wallet.pvKey')}`],
    },
  //   hardhat: {},
  //   sepolia: {
  //     url: config.get('web3.alchemy.apiKey'),
  //     accounts: [`0x${config.get('web3.wallet.pvKey')}`],
  //   },
  },
};
