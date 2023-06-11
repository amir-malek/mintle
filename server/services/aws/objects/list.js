// Import required AWS SDK clients and commands for Node.js
const { ListObjectsCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config');

const list = async ({
  bucketName,
}) => {
  try {
    const response = await s3.send(
      new ListObjectsCommand({
        Bucket: bucketName,
      }),
    );
    console.log('Success', response);
  } catch (err) {
    console.log('Error', err);
  }
};

module.exports = list;
