const assert = require('assert');
const debug = require('debug')('edunym:server');
const http = require('http');
const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const app = require('../app');
const config = require('../config.js');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Edunym tests', () => {
  before((done) => {
    const port = 5001;
    app.set('port', port);
    this.server = http.createServer(app);
    this.server.listen(port);
    this.server.once('listening', () => done());
  });

  after((done) => {
    this.server.close(done);
  });

  it('starts and shows the index page', () => new Promise((resolve) => {
    chai.request(app)
      .get('/')
      .end((err, res) => {
        assert.strictEqual(res.statusCode, 200);
        resolve();
      });
  }));

  describe('404', () => {
    it('shows a 404 page', () => new Promise((resolve) => {
      chai.request(app)
        .get('/path/to/nowhere')
        .set('content-type', 'text/html')
        .end((err, res) => {
          assert.strictEqual(res.statusCode, 404);
          resolve();
        });
    }));
  });

  describe('Outgoing LTI', () => {
    const toolUrl = 'https://example.org/tool';
    const current = new Date();
    const defaultMessage = {
      iss: config.platform.host,
      aud: 'dummy',
      sub: 'user1',
      exp: current.getTime() + 3 * 60,
      iat: current.getTime(),
      nonce: '123456789',
      'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiResourceLinkRequest',
      'https://purl.imsglobal.org/spec/lti/claim/roles': [
        'http://purl.imsglobal.org/vocab/lis/v2/membership#teacher',
      ],
      'https://purl.imsglobal.org/spec/lti/claim/resource_link': {
        id: '1',
      },
      'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
      'https://purl.imsglobal.org/spec/lti/claim/deployment_id': '1',
    };

    it('submits to URL decoded tool_url', () => new Promise((resolve) => {
      const message = defaultMessage;
      chai.request(app)
        .post(`/outgoing/?tool_url=${encodeURI(toolUrl)}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({ id_token: jwt.sign(message, config.platform.privateKey, { algorithm: 'RS256' }) })
        .end((err, res) => {
          assert.strictEqual(res.statusCode, 200);
          assert.ok(res.text.includes(`action="${decodeURI(toolUrl)}"`));
          resolve();
        });
    }));
  });
});
