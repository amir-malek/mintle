const config = require('config');
const { Queue } = require('bullmq');
const {
  Worker,
} = require('bullmq');
const fs = require('fs');
const http = require('http');
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

      http.get(media.sourceUrl, (response) => {
        response.pipe(file);

        file.on('finish', async () => {
          file.close();
          // file downloaded

          media.localPath = destDownloadPath;
          await media.save();

          await addImageJob(media.id);
        });
      });
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
