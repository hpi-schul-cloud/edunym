const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const router = express.Router();
const config = require('../config.js');

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Edunym' });
});

/* POST LTI Message */
router.post('/outgoing', (req, res) => {
  if (!req.query.tool_url) throw new Error('Request query has no client_url.');
  if (!req.body.id_token) throw new Error('Request body has no id_token');

  // TODO: create database
  // database: client public key, pseudonyms

  const idToken = jwt.decode(req.body.id_token);
  // TODO: verify message

  // TODO: replace pseudonym
  idToken.sub = 'you have been pseudonymized';

  // TODO: replace platform urls to edunym urls

  res.render('lti', {
    url: decodeURI(req.query.tool_url),
    idToken: jwt.sign(idToken, config.platform.privateKey, { algorithm: 'RS256' }),
  });
});

module.exports = router;
