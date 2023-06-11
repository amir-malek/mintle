const { createPresignedPost } = require('@aws-sdk/s3-presigned-post');
const s3 = require('../config');

const BUCKET_NAME = process.env.AWS_MAIN_BUCKET;

const Conditions = [
  { acl: 'public-read' },
  { bucket: BUCKET_NAME },
];

const Bucket = BUCKET_NAME;
const Fields = {
  acl: 'public-read',
};
const uploadPreSigned = async ({
  filename,
}) => {
  const {
    url,
    fields,
  } = await createPresignedPost(s3, {
    Bucket,
    Key: filename,
    Conditions,
    Fields,
    Expires: 3600, // Seconds before the presigned post expires. 3600 by default.
  });

  return {
    url,
    fields,
  };
};

module.exports = uploadPreSigned;
