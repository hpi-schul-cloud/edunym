const express = require('express');
const jwt = require('jsonwebtoken');
const debug = require('debug')('edunym:server');
const config = require('../config.js');
const User = require('../models/user.js');
const Tool = require('../models/tool.js');

const router = express.Router();

const deepLinkingSettings = 'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings';
const contentItems = 'https://purl.imsglobal.org/spec/lti-dl/claim/content_items';

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index', { title: 'Edunym' });
});

/* POST new client */
router.post('/tool', async (req, res, next) => {
  try {
    const tool = new Tool(req.body);
    await tool.save();
  } catch (error) {
    if (error.code === 11000) {
      return next('Tool exists');
    }
    return next(error);
  }

  return res.send(`${req.body.clientId} created`);
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
  const key = { idPlatform: idToken.sub, audTool: idToken.aud };
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
  idToken.sub = user.idTool;

  const edunymURL = `${req.protocol}://${req.get('host')}/incoming/?platform_url=`;
  if (idToken[deepLinkingSettings]) {
    idToken[deepLinkingSettings].deep_link_return_url = edunymURL
      + encodeURI(idToken[deepLinkingSettings].deep_link_return_url);
  }

  return res.render('lti', {
    url: decodeURI(req.query.tool_url),
    idToken: jwt.sign(idToken, config.platform.privateKey, { algorithm: 'RS256' }),
  });
});

/* POST Incoming LTI Message */
router.post('/incoming', async (req, res, next) => {
  if (!req.query.platform_url) return next('Request query has no platform_url');
  if (!req.body.id_token) return next('Request body has no id_token');

  const unverifiedToken = jwt.decode(req.body.id_token);
  const tool = await Tool.findOne({ clientId: unverifiedToken.iss }, 'publicKey');
  const idToken = jwt.verify(req.body.id_token,
    tool.publicKey,
    {
      algorithm: 'RS256',
      aud: config.platform.host,
      maxAge: 60,
    });

  if (!idToken) return next('Verificiation failed');

  if (!idToken.nonce) return next('No nonce included');

  if (idToken.sub) {
    const user = await User.findOne({ idTool: idToken.sub, audTool: idToken.iss });
    if (!user) return next('User does not exist');
    idToken.sub = user.idPlatform;
  }

  const edunymURL = `${req.protocol}://${req.get('host')}/outgoing/?tool_url=`;
  idToken[contentItems].url = edunymURL + encodeURI(idToken[contentItems].url);

  return res.render('lti', {
    url: decodeURI(req.query.platform_url),
    idToken: jwt.sign(idToken, config.platform.privateKey, { algorithm: 'RS256' }),
  });
});

module.exports = router;
