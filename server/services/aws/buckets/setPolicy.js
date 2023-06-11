const {
  S3Client,
  PutBucketPolicyCommand,
} = require('@aws-sdk/client-s3');
const s3 = require('../config');

const BUCKET_NAME = process.env.AWS_MAIN_BUCKET;

// Create the policy
const readOnlyAnonUserPolicy = {
  Version: '2012-10-17',
  Statement: [
    {
      Sid: 'AddPerm',
      Effect: 'Allow',
      Principal: '*',
      Action: ['s3:GetObject'],
      Resource: [''],
    },
  ],
};

// create selected bucket resource string for bucket policy
const bucketResource = `arn:aws:s3:::${BUCKET_NAME}/*`; // BUCKET_NAME
readOnlyAnonUserPolicy.Statement[0].Resource[0] = bucketResource;

// // convert policy JSON into string and assign into params
const bucketPolicyParams = {
  Bucket: BUCKET_NAME,
  Policy: JSON.stringify(readOnlyAnonUserPolicy),
};

const run = async () => {
  try {
    const response = await s3.send(
      new PutBucketPolicyCommand(bucketPolicyParams),
    );
    console.log('Success, permissions added to bucket', response);
  } catch (err) {
    console.log('Error', err);
  }
};

run();
