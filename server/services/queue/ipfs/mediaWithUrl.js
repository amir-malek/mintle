const config = require('config');
const { Queue } = require('bullmq');
const {
  Worker,
} = require('bullmq');
const fs = require('fs');
const { default: axios } = require('axios');
const { addJob: addImageJob } = require('./imageWithUrl');
const Media = require('../../../models/Media');

const redisProperties = {
  host: config.get('redis.host'),
  password: config.get('redis.password'),
};

const queue = new Queue('mediaQueue', {
  connection: redisProperties,
});

const addJob = async (data, opts = undefined) => {
  await queue.add('media-download', data, opts);
};

const addBulk = async (data, opts = undefined) => {
  for (let i = 0; i < data.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await queue.add('media-download', data[i], {
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
      const destDownloadPath = `./server/storage/nfts/${media.filename}`;

      const file = fs.createWriteStream(destDownloadPath);

      const response = await axios({
        url: media.sourceUrl,
        method: 'GET',
        responseType: 'stream',
      });

      response.data.pipe(file);

      media.localPath = destDownloadPath;
      await media.save();

      await addImageJob(media.image.id);
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
