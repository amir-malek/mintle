const { DeleteBucketCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config');

const deleteBucket = async ({
  bucketName,
}) => {
  try {
    const data = await s3.send(
      new DeleteBucketCommand({
        Bucket: bucketName,
      }),
    );
    console.log('Success', data);
  } catch (err) {
    console.log('Error', err);
  }
};

module.exports = deleteBucket;
