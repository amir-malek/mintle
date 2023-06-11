const { ListBucketsCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config');

const list = async () => {
  try {
    const data = await s3.send(new ListBucketsCommand({}));
    console.log('Success', data.Buckets);
  } catch (err) {
    console.log('Error', err);
  }
};

module.exports = list;
