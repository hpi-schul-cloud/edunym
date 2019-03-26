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

  it('shows a 404 page', () => new Promise((resolve) => {
    chai.request(app)
      .get('/path/to/nowhere')
      .set('content-type', 'text/html')
      .end((err, res) => {
        assert.strictEqual(res.statusCode, 404);
        resolve();
      });
  }));

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
    const idTokenPattern = /<input name="id_token" value="(.*)">/;

    const requestSub = (message, resolve) => {
      chai.request(app)
        .post(`/outgoing/?tool_url=${encodeURI(toolUrl)}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({ id_token: jwt.sign(message, config.platform.privateKey, { algorithm: 'RS256' }) })
        .end((err, res) => {
          const ltiRequest = jwt.decode(idTokenPattern.exec(res.text)[1]);
          resolve(ltiRequest.sub);
        });
    };

    const randomString = (length) => {
      let text = '';
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for (let i = 0; i < length; i += 1) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };

    it('submits to URL decoded tool_url', () => new Promise((resolve) => {
      chai.request(app)
        .post(`/outgoing/?tool_url=${encodeURI(toolUrl)}`)
        .set('content-type', 'application/x-www-form-urlencoded')
        .send({ id_token: jwt.sign(defaultMessage, config.platform.privateKey, { algorithm: 'RS256' }) })
        .end((err, res) => {
          assert.strictEqual(res.statusCode, 200);
          assert.ok(res.text.includes(`action="${decodeURI(toolUrl)}"`));
          resolve();
        });
    }));

    it('creates client user ids corresponding to the platform user ids', () => new Promise((resolve) => {
      const user1 = randomString(16);
      const user2 = randomString(16);
      Promise.all([
        new Promise((resolveInner) => {
          const message = JSON.parse(JSON.stringify(defaultMessage));
          message.sub = user1;
          requestSub(message, resolveInner);
        }),
        new Promise((resolveInner) => {
          const message = JSON.parse(JSON.stringify(defaultMessage));
          message.sub = user1;
          requestSub(message, resolveInner);
        }),
        new Promise((resolveInner) => {
          const message = JSON.parse(JSON.stringify(defaultMessage));
          message.sub = user2;
          requestSub(message, resolveInner);
        }),
      ]).then(([sub1, sub1Duplicate, sub2]) => {
        assert.strictEqual(sub1, sub1Duplicate);
        assert.ok(sub1 !== sub2);
        resolve();
      });
    }));

    it('creates different client user ids for different clients', () => new Promise((resolve) => {
      const client1 = randomString(16);
      const client2 = randomString(16);
      Promise.all([
        new Promise((resolveInner) => {
          const message = JSON.parse(JSON.stringify(defaultMessage));
          message.aud = client1;
          requestSub(message, resolveInner);
        }),
        new Promise((resolveInner) => {
          const message = JSON.parse(JSON.stringify(defaultMessage));
          message.aud = client1;
          requestSub(message, resolveInner);
        }),
        new Promise((resolveInner) => {
          const message = JSON.parse(JSON.stringify(defaultMessage));
          message.aud = client2;
          requestSub(message, resolveInner);
        }),
      ]).then(([aud1, aud1Duplicate, aud2]) => {
        assert.strictEqual(aud1, aud1Duplicate);
        assert.ok(aud1 !== aud2);
        resolve();
      });
    }));
  });
});
