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
  if (!req.query.tool_url) throw new Error('Request query has no client_url.')
  if(!req.body.id_token) throw new Error('Request body has no id_token')

  // TODO: create database
  // database: client public key, pseudonyms

  // TODO: verify message

  // TODO: replace pseudonym

  // TODO: replace platform urls to edunym urls

  res.render('lti', {
    url: decodeURI(req.query.tool_url),
    idToken: req.body.id_token,
  });
});

module.exports = router;
