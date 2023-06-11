// Import required AWS SDK clients and commands for Node.js
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config');

// call S3 to retrieve upload file to specified bucket
const deleteObj = async ({
  bucketName,
}) => {
  try {
    const data = await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: 'file.png',
        // VersionId: 'version2.2',
      }),
    );
    console.log('Success', data);
  } catch (err) {
    console.log('Error', err);
  }
};

module.exports = deleteObj;
