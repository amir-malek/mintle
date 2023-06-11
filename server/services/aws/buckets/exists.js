const { HeadBucketCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config');

const exists = async (bucketName) => s3.send(
  new HeadBucketCommand({
    Bucket: bucketName,
  }),
);

module.exports = exists;
