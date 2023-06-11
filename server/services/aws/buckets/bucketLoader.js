const buckets = require('.');

const { AWS_MAIN_BUCKET } = process.env;

const loadBucket = async () => {
  try {
    const exists = await buckets.exists(AWS_MAIN_BUCKET);
    console.log(exists);
  } catch (e) {
    console.log(e);
  }
};

module.exports = loadBucket;
