const mongoose = require('mongoose');

const { Schema } = mongoose;

const collectionSchema = new Schema({
  status: {
    type: String,
    enum: ['SUCCESS', 'PENDING', 'FAILED'],
    default: 'PENDING',
  },
  address: {
    type: String,
  },
  name: {
    type: String,
  },
  symbol: {
    type: String,
  },
  callback: {
    type: String,
  },
});

module.exports = mongoose.model('Collection', collectionSchema);
