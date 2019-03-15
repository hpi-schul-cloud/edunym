'use strict';

const assert = require('assert');
const app = require('../app');
const debug = require('debug')('edunym:server');
const http = require('http');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('Edunym tests', function () {
	before(function (done) {
		const port = 3001;
    app.set('port', port);
    this.server = http.createServer(app);
    this.server.listen(port);
		this.server.once('listening', () => done());
	});

	after(function (done) {
		this.server.close(done);
	});

	it('starts and shows the index page', function () {
		return new Promise((resolve, reject) => {
			chai.request(app)
				.get('/')
				.end((err, res) => {
					assert.strictEqual(res.statusCode, 200);
					resolve();
				});
		});
	});

	describe('404', function () {
		it('shows a 404 page', function () {
			return new Promise((resolve, reject) => {
				chai.request(app)
					.get('/path/to/nowhere')
					.set('content-type', 'text/html')
					.end((err, res) => {
						assert.strictEqual(res.statusCode, 404);
						resolve();
					});
			});
		});
	});

  describe('Outgoing LTI', function () {
    const id_token = '';
    const toolUrl = 'https://example.org/tool';

    it('submits to URL decoded tool_url', function () {
      return new Promise((resolve, reject) => {
        chai.request(app)
          .post(`/outgoing/?tool_url=${encodeURI(toolUrl)}`)
          .set('content-type', 'application/x-www-form-urlencoded')
          .send({id_token})
          .end((err, res) => {
            assert.strictEqual(res.statusCode, 200);
            assert.ok(res.text.includes(`action="${decodeURI(toolUrl)}"`));
            resolve();
          });
      });
    });

  });
});
