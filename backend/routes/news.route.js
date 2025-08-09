
const express = require('express');
const { getNewsByCategory } = require('../controllers/news.controller');

const router = express.Router();

router.get('/:category', getNewsByCategory);

module.exports = router;