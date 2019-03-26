const express = require('express');
const jwt = require('jsonwebtoken');
const debug = require('debug')('edunym:server');
const config = require('../config.js');
const User = require('../models/user.js');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Edunym' });
});

/* POST LTI Message */
router.post('/outgoing', async (req, res) => {
  if (!req.query.tool_url) throw new Error('Request query has no client_url.');
  if (!req.body.id_token) throw new Error('Request body has no id_token');

  const idToken = jwt.decode(req.body.id_token);
  // TODO: verify message

  let user = await User.findOne({ idPlatform: idToken.sub, client: idToken.aud }, 'pseudonym');
  if (!user) {
    user = new User({ idPlatform: idToken.sub, client: idToken.aud });
    user.save();
  }
  idToken.sub = user.idClient;

  // TODO: replace platform urls to edunym urls

  res.render('lti', {
    url: decodeURI(req.query.tool_url),
    idToken: jwt.sign(idToken, config.platform.privateKey, { algorithm: 'RS256' }),
  });
});

module.exports = router;
