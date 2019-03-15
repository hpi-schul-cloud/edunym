const express = require('express');
const config = require('../config.js');
const mongoose = require('mongoose');

const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Edunym' });
});

/* POST LTI Message */
router.post('/outgoing', function(req, res, next) {
  if (!req.query.tool_url) throw new Error('Query does not contain required client_url.')

  // TODO: create database
  // database: client public key, pseudonyms

  // TODO: verify signature

  // TODO: replace platform urls to edunym urls

  res.render('lti', {
    url: decodeURI(req.query.tool_url),
    idToken: '',
  });
});

module.exports = router;
