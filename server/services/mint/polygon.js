// const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
// const config = require('config');
// const MintNFT721 = require('../../artifacts/server/contracts/Mint721.sol/MyNFT.json');

// const web3 = createAlchemyWeb3(config.get('web3.alchemy.sepolia.apiUrl'));

// const mint721 = async (to, uri) => {
//   const nftContract = new web3.eth.Contract(MintNFT721.abi, config.get('web3.contract.address'));

//   const nonce = await web3.eth.getTransactionCount(config.get('web3.wallet.address'), 'latest');

//   const tx = {
//     from: config.get('web3.wallet.address'),
//     to,
//     nonce,
//     gas: 500000,
//     data: nftContract.methods.mintNFT(to, uri).encodeABI(),
//   };

//   const signPromise = web3.eth.accounts.signTransaction(tx, config.get('web3.wallet.pvKey'));
//   return signPromise
//     .then((signedTx) => {
//       web3.eth.sendSignedTransaction(
//         signedTx.rawTransaction,
//         (err, hash) => {
//           if (!err) {
//             console.log(
//               'The hash of your transaction is: ',
//               hash,
//               "\nCheck Alchemy's Mempool to view the status of your transaction!",
//             );
//           } else {
//             console.log(
//               'Something went wrong when submitting your transaction:',
//               err,
//             );
//           }
//         },
//       );
//     })
//     .catch((err) => {
//       console.log('Promise failed:', err);
//     });
// };

// module.exports = mint721;

// // const ethers = require('ethers');
// // const config = require('config');
// // const contract = require('../../artifacts/server/contracts/Mint721.sol/MyNFT.json');

// // const mintNFT = async () => {
// //   const apiKey = config.get('web3.alchemy.sepolia.apiKey');
// //   const provider = new ethers.providers.AlchemyProvider('sepolia', apiKey);

// //   const signer = new ethers.Wallet(config.get('web3.wallet.pvKey'), provider);

// //   const myNftContract = new ethers.Contract(config.get('web3.contract.address'), contract.abi, signer);

// //   const nftTxn = await myNftContract.mintNFT(signer.address, 'tokenUri');
// //   await nftTxn.wait();
// //   console.log(`NFT Minted! Check it out at: https://sepolia.etherscan.io/tx/${nftTxn.hash}`);
// // };

// // module.exports = mintNFT;

const { Web3 } = require('web3');
const config = require('config');

const contract = require('../../artifacts/server/contracts/Mint721.sol/MyNFT.json');

module.exports = async (to, uri) => {
  const web3 = new Web3(config.get('web3.alchemy.sepolia.apiUrl'));

  const networkId = await web3.eth.net.getId();
  const myContract = new web3.eth.Contract(
    contract.abi,
    config.get('web3.contract.address'),
  );

  const tx = myContract.methods.mintNFT(to, uri);

  const gas = await tx.estimateGas({
    from: config.get('web3.wallet.address'),
  });

  const gasPrice = await web3.eth.getGasPrice();
  const data = tx.encodeABI();
  const nonce = await web3.eth.getTransactionCount(config.get('web3.wallet.address'));

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: config.get('web3.contract.address'),
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
