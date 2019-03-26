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
          throw Error(error);
        }
      }
    }
  } while (!user);
  idToken.sub = user.idClient;

  // TODO: replace platform urls to edunym urls

  res.render('lti', {
    url: decodeURI(req.query.tool_url),
    idToken: jwt.sign(idToken, config.platform.privateKey, { algorithm: 'RS256' }),
  });
});

module.exports = router;
