const NFTModel = require('../models/NFT');
const { BadRequestError } = require('../utils/ApiError');
const {addJob: addMintJob} = require('../services/queue/mint')


module.exports = {
    PostMint721: async (req,res,next) => {
        try {
            const nft = await NFTModel.findById(req.params.nftId)

            if(!nft) throw new BadRequestError('Specified nft not found')

            await addMintJob(nft.id)

            res.send({
                message: 'mint process added to queue'
            })
        } catch (e) {
            next(e)
        }
    }
}