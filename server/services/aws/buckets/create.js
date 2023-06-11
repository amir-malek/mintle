const { CreateBucketCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config');

const create = async ({
  bucketName,
  access,
}) => {
  try {
    const data = await s3.send(
      new CreateBucketCommand({
        Bucket: bucketName,
        ACL: access, // 'private' | 'public-read'
      }),
    );

    return data;
  } catch (err) {
    console.log('Error', err);
  }
};

module.exports = create;
