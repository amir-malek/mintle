const mongoose = require('mongoose');

const { Schema } = mongoose;

const mediaSchema = new Schema({
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
  image: {
    type: Schema.Types.ObjectId,
    ref: 'Image',
  },
});

module.exports = mongoose.model('Media', mediaSchema);
