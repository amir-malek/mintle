const config = require('config');
const { NFTStorage } = require('nft.storage');

module.exports = new NFTStorage({
  token: config.get('nft.storage.token'),
});
