const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const config = require('config');
const MintNFT721 = require('../../artifacts/server/contracts/Mint721.sol/MintNFT721.json');

const web3 = createAlchemyWeb3(config.get('web3.alchemy.apiUrl'));

const mint721 = async (to, uri) => {
  const nftContract = new web3.eth.Contract(MintNFT721.abi, config.get('web3.contract.address'));

  const nonce = await web3.eth.getTransactionCount(config.get('web3.wallet.address'), 'latest');

  const tx = {
    from: config.get('web3.wallet.address'),
    to,
    nonce,
    gas: 500000,
    data: nftContract.methods.mint(to, uri).encodeABI(),
  };

  const signPromise = web3.eth.accounts.signTransaction(tx, config.get('web3.wallet.pvKey'));

  return signPromise.then((signedTx) => web3.eth.sendSignedTransaction(
    signedTx.rawTransaction,
    (err, hash) => {
      if (!err) {
        return hash;
      }
      throw new Error(err);
    },
  ));
};

module.exports = mint721;
