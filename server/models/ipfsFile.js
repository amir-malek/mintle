const mongoose = require('mongoose');

const { Schema } = mongoose;

const ipfsFileSchema = new Schema({
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
  cid: {
    type: String,
  },
});

module.exports = mongoose.model('IpfsFile', ipfsFileSchema);
