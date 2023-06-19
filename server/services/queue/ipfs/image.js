const config = require('config');
const { Queue } = require('bullmq');
const {
  Worker,
} = require('bullmq');
const fs = require('fs');
const { File } = require('nft.storage');
const Image = require('../../../models/Image');
const NFTModel = require('../../../models/NFT');

const nftStorageStore = require('../../ipfs/nft.storage/store');

const redisProperties = {
  host: config.get('redis.host'),
  password: config.get('redis.password'),
};

const queue = new Queue('imageQueue', {
  connection: redisProperties,
});

const addJob = async (data, opts = undefined) => {
  await queue.add('image-upload', data, opts);
};

const addBulk = async (data, opts = undefined) => {
  for (let i = 0; i < data.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await queue.add('image-upload', data[i], {
      delay: i * 2 * 60 * 1000,
      ...opts,
    });
  }
};

const workerInstance = new Worker(
  queue.name,
  async (job) => {
    const image = await Image.findById(job.data);

    if (image.status === 'FAILED' || image.status === 'PENDING') {
      const fileBuffer = fs.readFileSync(image.localPath);

      const file = new File([fileBuffer], image.filename, {
        type: image.mimetype,
      });

      const nft = await NFTModel.findOne({
        image: image.id,
      });

      const data = await nftStorageStore({
        image: file,
        name: nft.metadata.name,
        description: nft.metadata.description,
        external_url: nft.metadata.external_url,
        animation_url: nft.metadata.animation_url,
      });

      console.log(data);

      image.status = 'SUCCESS';
      await image.save();
    }
  },
  {
    connection: redisProperties,
    concurrency: 1,
  },
);

workerInstance.on('completed', async (job) => {
  // const ipfs = await IpfsFile.findById(job.data);
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