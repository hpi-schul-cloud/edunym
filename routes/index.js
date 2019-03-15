const express = require('express');
const config = require('../config.js');

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Edunym' });
});

/* POST LTI Message */
router.post('/', function(req, res, next) {
  // TODO: write tests

  // TODO: create database
  // database: client public key, pseudonyms
  // parameter: client host

  // TODO: verify signature

  // TODO: replace platform urls to edunym urls

  res.render('lti', {
    url: req.query.client_url,
    idToken: '',
  });
});

module.exports = router;
