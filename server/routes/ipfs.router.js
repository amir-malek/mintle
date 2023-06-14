const express = require('express');
const ipfsController = require('../controllers/ipfs.controller');

const router = express.Router();

router.post('/upload', ipfsController.PostUploadSingleFile);

module.exports = router;
