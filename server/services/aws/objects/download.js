const { GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const s3 = require('../config');

let param = {
  Bucket: process.env.AWS_MAIN_BUCKET,
};

// call S3 to retrieve upload file to specified bucket
module.exports = async (key) => {
  try {
    param = {
      ...param,
      Key: key,
    };

    const data = await s3.send(new GetObjectCommand(param));
    return data.Body;
  } catch (err) {
    console.log('Error', err);
  }
};
