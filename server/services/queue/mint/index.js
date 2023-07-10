const config = require('config');
const { Queue } = require('bullmq');
const {
  Worker,
} = require('bullmq');
const { default: axios } = require('axios');
const NFTModel = require('../../../models/NFT');
const mintNFT = require('../../mint/polygon');

const redisProperties = {
  host: config.get('redis.host'),
  password: config.get('redis.password'),
};

const queue = new Queue('mintQueue', {
  connection: redisProperties,
  concurrency: 1,
});

const addJob = async (data, opts = undefined) => {
  await queue.add('mint-nft', data, opts);
};

const addBulk = async (data, opts = undefined) => {
  for (let i = 0; i < data.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await queue.add('mint-nft', data[i], {
      delay: i * 2 * 60 * 1000,
      ...opts,
    });
  }
};

const workerInstance = new Worker(
  queue.name,
  async (job) => {
    const nft = await NFTModel.findById(job.data);

    if (!nft.ipfsUrl) throw new Error('No ipfs URI provided');

    if (nft.mintStatus === 'FAILED' || nft.mintStatus === 'NOT_SET') {
      const receipt = await mintNFT(nft.destinationAddress, nft.ipfsUrl);

      // if (receipt.status === '1n') {
      nft.mintStatus = 'SUCCESS';
      nft.txHash = receipt.transactionHash;
      nft.tokenId = Number(receipt.data);
      await nft.save();
      // } else {
      //   throw new Error('NFT mint error');
      // }
    }
  },
  {
    connection: redisProperties,
    concurrency: 1,
  },
);

workerInstance.on('completed', async (job) => {
  try {
    const nft = NFTModel.findById(job.data);

    await axios.post(nft.callback, {
      nftId: nft.id,
    });
  } catch (e) {
    console.log('Callback call failed');
  }
});

workerInstance.on('failed', async (job) => {
  const nft = await NFTModel.findById(job.data);

  nft.mintStatus = 'FAILED';
  await nft.save();
});

workerInstance.on('error', (err) => {
  console.log(err);
});

module.exports = {
  addJob,
  addBulk,
};
