const config = require('config');
const { Queue } = require('bullmq');
const {
  Worker,
} = require('bullmq');
const fs = require('fs');
const { File } = require('nft.storage');
const Media = require('../../../models/Media');
const NFTModel = require('../../../models/NFT');
const { addJob: addImageJob } = require('./image');
const web3Put = require('../../ipfs/web3.storage/put');

const redisProperties = {
  host: config.get('redis.host'),
  password: config.get('redis.password'),
};

const queue = new Queue('mediaQueue', {
  connection: redisProperties,
  concurrency: 1,
});

const addJob = async (data, opts = undefined) => {
  await queue.add('media-upload', data, opts);
};

const addBulk = async (data, opts = undefined) => {
  for (let i = 0; i < data.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await queue.add('media-upload', data[i], {
      delay: i * 2 * 60 * 1000,
      ...opts,
    });
  }
};

const workerInstance = new Worker(
  queue.name,
  async (job) => {
    const media = await Media.findById(job.data);

    if (media.status === 'FAILED' || media.status === 'PENDING') {
      const fileBuffer = fs.readFileSync(media.localPath);

      const file = new File([fileBuffer], media.filename, {
        type: media.mimetype,
      });

      const cid = await web3Put(file);

      const nft = await NFTModel.findOne({
        media: media.id,
      });

      nft.metadata.animation_url = `ipfs://${cid}/${media.filename}`;
      await nft.save();

      media.cid = cid;
      media.status = 'SUCCESS';
      await media.save();
    }
  },
  {
    connection: redisProperties,
    concurrency: 1,
  },
);

workerInstance.on('completed', async (job) => {
  const media = await Media.findById(job.data);

  await addImageJob(media.image, {
    delay: 2 * 60 * 1000,
  });
});
workerInstance.on('failed', async (job) => {
  const media = await Media.findById(job.data);

  media.status = 'FAILED';
  await media.save();
});

module.exports = {
  addJob,
  addBulk,
};
