const NFTModel = require('../models/NFT');
const { BadRequestError } = require('../utils/ApiError');
// const { addJob: addMintJob } = require('../services/queue/mint');
const mint721 = require('../services/mint/polygon');

module.exports = {
  PostMint721: async (req, res, next) => {
    try {
      const nft = await NFTModel.findById(req.params.nftId);

      if (!nft) throw new BadRequestError('Specified nft not found');

      nft.destinationAddress = req.body.address;
      await nft.save();

      //   await addMintJob(nft.id);

      const hash = await mint721(req.body.address, nft.ipfsUrl);

      res.send({
        message: 'mint process added to queue',
        hash,
      });
    } catch (e) {
      next(e);
    }
  },
};
