const config = require('config');
const { Queue } = require('bullmq');
const {
  Worker,
} = require('bullmq');
const fs = require('fs');
const http = require('http');
const { default: axios } = require('axios');
const Image = require('../../../models/Image');
const { addJob: addImageJob } = require('./image');

const redisProperties = {
  host: config.get('redis.host'),
  password: config.get('redis.password'),
};

const queue = new Queue('imageQueue', {
  connection: redisProperties,
});

const addJob = async (data, opts = undefined) => {
  await queue.add('image-download', data, opts);
};

const addBulk = async (data, opts = undefined) => {
  for (let i = 0; i < data.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await queue.add('image-download', data[i], {
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
      const destDownloadPath = `./server/storage/nfts/${image.filename}`;

      const file = fs.createWriteStream(destDownloadPath);

      const response = await axios({
        url: image.sourceUrl,
        method: 'GET',
        responseType: 'stream',
      });

      response.data.pipe(file);

      image.localPath = destDownloadPath;
      await image.save();
    }
  },
  {
    connection: redisProperties,
    concurrency: 1,
  },
);

workerInstance.on('failed', async (job) => {
});

module.exports = {
  addJob,
  addBulk,
};
