const { PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = require('../config');

const uploadParams = {
  Bucket: process.env.AWS_MAIN_BUCKET, // bucket name
  Key: 'object-name',
  ACL: 'public-read',
  Body: 'BODY',
};

// call S3 to retrieve upload file to specified bucket
const upload = async (fileStream, key) => {
  // const fileStream = fs.createReadStream(file);
  fileStream.on('error', (err) => {
    console.log('File Error', err);
  });
  uploadParams.Key = key;
  uploadParams.Body = fileStream;

  const data = await s3.send(new PutObjectCommand(uploadParams));
  console.log('Success', data);
  return key;
};

module.exports = upload;
