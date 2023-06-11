const deleteObject = require('./delete');
const list = require('./list');
const upload = require('./upload');
const uploadPreSigned = require('./upload-pre-signed');
const download = require('./download');

module.exports = {
  deleteObject,
  list,
  upload,
  uploadPreSigned,
  download,
};
