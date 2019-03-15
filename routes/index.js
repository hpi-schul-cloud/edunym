const express = require('express');
const config = require('../config.js');

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Edunym' });
});

/* POST LTI Message */
router.post('/', function(req, res, next) {
  // TODO: create configuration, database and
  // configuration: platform private key, platform public key
  // database: client public key, pseudonyms
  // parameter: client host
  // TODO: verify signature
});

module.exports = router;
