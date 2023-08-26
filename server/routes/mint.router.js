const express = require('express');
const mintController = require('../controllers/mint.controller');

const router = express.Router();

router.post('/721/:nftId', mintController.PostMint721);
router.put('/nfts/retry', mintController.PutRetryAll);
// todo: add retry api
module.exports = router;
