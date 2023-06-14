const config = require('config');
const { Web3Storage } = require('web3.storage');

module.exports = new Web3Storage({
  token: config.get('web3.storage.token'),
});
