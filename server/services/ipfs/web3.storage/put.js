const storage = require('./instance');

const cid = async (file) => storage.put([file]);

module.exports = cid;
