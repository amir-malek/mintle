const { Web3 } = require('web3');
const config = require('config');

const contract = require('../../artifacts/server/contracts/Mint721.sol/MintNFT721.json');

module.exports = async (to, uri) => {
  const web3 = new Web3(config.get('web3.alchemy.sepolia.apiUrl'));

  const networkId = await web3.eth.net.getId();
  const myContract = new web3.eth.Contract(
    contract.abi,
    config.get('web3.contracts.mint.address'),
  );

  const tx = myContract.methods.mint(to, uri);

  const gas = await tx.estimateGas({
    from: config.get('web3.wallet.address'),
  });

  const gasPrice = await web3.eth.getGasPrice();
  const data = tx.encodeABI();
  const nonce = await web3.eth.getTransactionCount(config.get('web3.wallet.address'));

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: config.get('web3.contracts.mint.address'),
      data,
      gas,
      gasPrice,
      nonce,
      chainId: networkId,
    },
    config.get('web3.wallet.pvKey'),
  );

  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

  return receipt;
};
