const config = require('config');
const { Queue } = require('bullmq');
const {
  Worker,
} = require('bullmq');
const fs = require('fs');
const { File } = require('nft.storage');
const { default: axios } = require('axios');
const Image = require('../../../models/Image');
const NFTModel = require('../../../models/NFT');

const nftStorageStore = require('../../ipfs/nft.storage/store');
const NFT = require('../../../models/NFT');

const redisProperties = {
  host: config.get('redis.host'),
  password: config.get('redis.password'),
};

const queue = new Queue('collectionQueue', {
  connection: redisProperties,
});

const addJob = async (data, opts = undefined) => {
  await queue.add('collection-creation', data, opts);
};

const addBulk = async (data, opts = undefined) => {
  for (let i = 0; i < data.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await queue.add('collection-creation', data[i], {
      delay: i * 2 * 60 * 1000,
      ...opts,
    });
  }
};

const workerInstance = new Worker(
  queue.name,
  async (job) => {
 
  },
  {
    connection: redisProperties,
    concurrency: 1,
  },
);

workerInstance.on('completed', async (job) => {
  const image = await Image.findById(job.data);

  const nft = await NFT.findOne({ image: image.id });

  await axios.post(image.callback, {
    nftId: nft.id,
  });
});

workerInstance.on('failed', async (job) => {
  const media = await Image.findById(job.data);

  media.status = 'FAILED';
  await media.save();
});

workerInstance.on('error', (err) => {
  console.log(err);
});

module.exports = {
  addJob,
  addBulk,
};