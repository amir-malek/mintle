const mongoose = require('mongoose');

const { Schema } = mongoose;

const imageSchema = new Schema({
  status: {
    type: String,
    enum: ['SUCCESS', 'PENDING', 'FAILED'],
    default: 'PENDING',
  },
  localPath: {
    type: String,
  },
  filename: {
    type: String,
  },
  mimetype: {
    type: String,
  },
  nftData: {
    type: JSON,
  },
});

module.exports = mongoose.model('Image', imageSchema);
