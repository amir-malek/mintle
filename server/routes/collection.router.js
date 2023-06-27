const express = require('express');
const collectionController = require('../controllers/collection.controller');

const router = express.Router();

router.post('/create', collectionController.create);

module.exports = router;
