const { ethers } = require('hardhat');
const config = require('config');
const fs = require('fs');

const getConfigFile = () => {
  const env = process.env.NODE_ENV;

  if (env === 'dev' || env === 'development') {
    return {
      path: '../../config/dev.json',
      file: require('../../config/dev.json'),
      writePath: '/app/config/dev.json',
    };
  } if (env === 'prod' || env === 'production') {
    return {
      path: '../../config/prod.json',
      file: require('../../config/prod.json'),
      writePath: '/app/config/prod.json',
    };
  }
  return {
    path: '../../config/test.json',
    file: require('../../config/test.json'),
    writePath: '/app/config/test.json',
  };
};

async function main() {
  const Mint721 = await ethers.getContractFactory('MintNFT721');

  const myNFT = await Mint721.deploy(
    'Moment General Minting',
    'MMNT',
    config.get('web3.wallet.address'),
    config.get('web3.wallet.address'),
  );
  await myNFT.deployed();

  const ERC721Factory = await ethers.getContractFactory('ERC721Factory');
  const myErc721Factory = await ERC721Factory.deploy(
    myNFT.address,
  );
  await myErc721Factory.deployed();

  const configFile = getConfigFile();

  const obj = configFile.file;

  obj.web3.contracts.mint.address = myNFT.address;
  obj.web3.contracts.factory.address = myErc721Factory.address;

  const json = JSON.stringify(obj);

  fs.writeFileSync(configFile.writePath, json, { encoding: 'utf8', flag: 'w' });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
