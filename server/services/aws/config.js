const { S3Client } = require('@aws-sdk/client-s3');
const config = require('config');

const s3 = new S3Client({
  region: config.get('aws.S3.region'),
  endpoint: config.get('aws.S3.endpoint'),
  credentials: {
    accessKeyId: config.get('aws.accessKeyId'),
    secretAccessKey: config.get('aws.secretAccessKey'),
  },
});

module.exports = s3;
