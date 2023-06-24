const mongoose = require('mongoose');

const { Schema } = mongoose;

const MetadataSchema = new Schema({
  description: String,
  external_url: String,
  name: String,
  animation_url: String,
});

const NFTSchema = new Schema({
  image: {
    type: Schema.Types.ObjectId,
    ref: 'Image',
  },
  media: {
    type: Schema.Types.ObjectId,
    ref: 'Media',
  },
  ipfsUrl: String,
  metadata: MetadataSchema,
});

module.exports = mongoose.model('NFT', NFTSchema);
