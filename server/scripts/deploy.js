const { ethers } = require('hardhat');
const config = require('config');
const fs = require('fs');
const path = require('path');

const getConfigFile = () => {
  const env = process.env.NODE_ENV;

  if (env === 'dev' || env === 'development') {
    return {
      path: '../../config/dev.json',
      file: require('../../config/dev.json'),
      writePath: '/app/config/dev.json',
    };
  }
};

async function main() {
  const Mint721 = await ethers.getContractFactory('MintNFT721');

  const myNFT = await Mint721.deploy(
    'Moment',
    'MMNT',
    config.get('web3.wallet.address'),
    config.get('web3.wallet.address'),
  );
  await myNFT.deployed();

  const configFile = getConfigFile();

  const obj = configFile.file;

  obj.web3.contract.address = myNFT.address;

  const json = JSON.stringify(obj);

  fs.writeFileSync(configFile.writePath, json, { encoding: 'utf8', flag: 'w' });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
