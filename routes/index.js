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
router.post('/outgoing', async (req, res, next) => {
  if (!req.query.tool_url) return next('Request query has no tool_url');
  if (!req.body.id_token) return next('Request body has no id_token');

  const idToken = jwt.verify(req.body.id_token,
    config.platform.publicKey,
    {
      algorithm: 'RS256',
      issuer: config.platform.host,
      maxAge: 60,
    });
  if (!idToken.nonce) return next('No nonce included');

  let user = null;
  const key = { idPlatform: idToken.sub, client: idToken.aud };
  do {
    user = await User.findOne(key); // eslint-disable-line no-await-in-loop
    if (!user) {
      try {
        user = new User(key);
        await user.save(); // eslint-disable-line no-await-in-loop
      } catch (error) {
        if (error.code === 11000) {
          user = null;
        } else {
          return next(error);
        }
      }
    }
  } while (!user);
  idToken.sub = user.idClient;

  // TODO: replace platform urls to edunym urls

  return res.render('lti', {
    url: decodeURI(req.query.tool_url),
    idToken: jwt.sign(idToken, config.platform.privateKey, { algorithm: 'RS256' }),
  });
});

module.exports = router;
