const nftStorage = require('./instance');

const storedData = async (data) => nftStorage.store(data);

module.exports = storedData;
