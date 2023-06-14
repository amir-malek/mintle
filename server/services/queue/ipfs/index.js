const config = require('config');
const { Queue } = require('bullmq');
const {
  Worker,
} = require('bullmq');
const fs = require('fs');
const { File } = require('nft.storage');
const IpfsFile = require('../../../models/ipfsFile');

const web3Put = require('../../ipfs/web3.storage/put');

const redisProperties = {
  host: config.get('redis.host'),
  password: config.get('redis.password'),
};

const queue = new Queue('ipfsQueue', {
  connection: redisProperties,
});

const addJob = async (data) => {
  await queue.add('ipfs-upload', data);
};

const addBulk = async (data) => {
  for (let i = 0; i < data.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    await queue.add('ipfs', data[i], {
      delay: i * 2 * 60 * 1000,
    });
  }
};

const workerInstance = new Worker(
  queue.name,
  async (job) => {
    const ipfs = await IpfsFile.findById(job.data);

    const fileBuffer = fs.readFileSync(ipfs.localPath);

    const file = new File([fileBuffer], ipfs.filename, {
      type: ipfs.mimetype,
    });

    const cid = await web3Put(file);

    ipfs.cid = cid;
    ipfs.status = 'SUCCESS';
    await ipfs.save();
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
  const ipfs = await IpfsFile.findById(job.data);

  ipfs.status = 'FAILED';
  await ipfs.save();
});

module.exports = {
  addJob,
  addBulk,
};
