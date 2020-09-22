'use strict';

var assert = require('assert');
var nock = require('nock');

var FastlyPurge = require('../');

describe('FastlyPurge', function() {

    var FAKE_API_KEY = 'wadus';
    var FAKE_SERVICE_ID = 'wadus_service_id';
    var FAKE_SURROGATE_KEY = 'wadus_key';

    var FAKE_PURGE_HOST = 'http://example.com';
    var FAKE_PURGE_PATH = '/image.jpg';
    var FAKE_PURGE_URL = FAKE_PURGE_HOST + FAKE_PURGE_PATH;

    describe('instant purge', function() {
        var fastlyPurge = new FastlyPurge(FAKE_API_KEY);

        it('should purge URL with no Fastly headers', function(done) {
            var scope = nock(FAKE_PURGE_HOST)
                .intercept(FAKE_PURGE_PATH, 'PURGE')
                .reply(200, {
                    status:'ok',
                    id:'108-1391560174-974124'
                });

            fastlyPurge.url(FAKE_PURGE_URL, function(err, result) {
                assert.ok(!err);
                assert.ok(result);
                assert.strictEqual(result.status, 'ok');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

        it('should purge SERVICE with Fastly API key header', function(done) {
            var purgePath = '/service/' + FAKE_SERVICE_ID + '/purge_all';
            var scope = nock(FastlyPurge.FASTLY_API_ENDPOINT)
                .post(purgePath)
                .matchHeader('Fastly-Key', FAKE_API_KEY)
                .matchHeader('Accept', 'application/json')
                .reply(200, {
                    status:'ok'
                });

            fastlyPurge.service(FAKE_SERVICE_ID, function(err, result) {
                assert.ok(!err, err && err.message);
                assert.ok(result);
                assert.strictEqual(result.status, 'ok');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

        it('should purge by surrogate KEY with Fastly API key header', function(done) {
            var purgePath = '/service/' + FAKE_SERVICE_ID + '/purge/' + FAKE_SURROGATE_KEY;
            var scope = nock(FastlyPurge.FASTLY_API_ENDPOINT)
                .post(purgePath)
                .matchHeader('Fastly-Key', FAKE_API_KEY)
                .matchHeader('Accept', 'application/json')
                .reply(200, {
                    status:'ok'
                });

            fastlyPurge.key(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, function(err, result) {
                assert.ok(!err, err && err.message);
                assert.ok(result);
                assert.strictEqual(result.status, 'ok');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });
    });

    describe('shielding purge', function() {
        var fastlyPurge = new FastlyPurge(FAKE_API_KEY);
        
        it('should purge twice by surrogate KEY with Fastly API key header', function(done) {
            var purgePath = '/service/' + FAKE_SERVICE_ID + '/purge/' + FAKE_SURROGATE_KEY;
            var scope = nock(FastlyPurge.FASTLY_API_ENDPOINT)
                .post(purgePath)
                .matchHeader('Fastly-Key', FAKE_API_KEY)
                .matchHeader('Accept', 'application/json')
                .times(2)
                .reply(200, {
                    status:'ok'
                });

            var options = {
                shieldingDelay: 100,
                shieldingWait: true
            };

            fastlyPurge.shieldingKey(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, options, function(err, result) {
                assert.ok(!err, err && err.message);
                assert.ok(result);
                assert.strictEqual(result.status, 'ok');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });
    });

    describe('soft purge', function() {
        var fastlyPurge = new FastlyPurge(FAKE_API_KEY, { softPurge: true });

        it('should purge URL with Fastly soft purge header but no API key', function(done) {
            var scope = nock(FAKE_PURGE_HOST)
                .intercept(FAKE_PURGE_PATH, 'PURGE')
                .matchHeader('Fastly-Soft-Purge', 1)
                .reply(200, {
                    status:'ok',
                    id:'108-1391560174-974124'
                });

            fastlyPurge.url(FAKE_PURGE_URL, function(err, result) {
                assert.ok(!err);
                assert.ok(result);
                assert.strictEqual(result.status, 'ok');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

        it('should purge SERVICE with Fastly API key header but no soft purge', function(done) {
            var purgePath = '/service/' + FAKE_SERVICE_ID + '/purge_all';
            var scope = nock(FastlyPurge.FASTLY_API_ENDPOINT)
                .post(purgePath)
                .matchHeader('Fastly-Key', FAKE_API_KEY)
                .matchHeader('Accept', 'application/json')
                .reply(200, {
                    status:'ok'
                });

            fastlyPurge.service(FAKE_SERVICE_ID, {}, function(err, result) {
                assert.ok(!err, err && err.message);
                assert.ok(result);
                assert.strictEqual(result.status, 'ok');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

        it('should purge by surrogate KEY with Fastly API key and soft purge header', function(done) {
            var purgePath = '/service/' + FAKE_SERVICE_ID + '/purge/' + FAKE_SURROGATE_KEY;
            var scope = nock(FastlyPurge.FASTLY_API_ENDPOINT)
                .post(purgePath)
                .matchHeader('Fastly-Key', FAKE_API_KEY)
                .matchHeader('Fastly-Soft-Purge', 1)
                .matchHeader('Accept', 'application/json')
                .reply(200, {
                    status:'ok'
                });

            fastlyPurge.key(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, function(err, result) {
                assert.ok(!err, err && err.message);
                assert.ok(result);
                assert.strictEqual(result.status, 'ok');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

    });

    describe('override soft purge for instant purge', function() {
        var fastlyPurge = new FastlyPurge(FAKE_API_KEY, { softPurge: true });

        it('should purge URL with NO Fastly soft purge header', function(done) {
            var scope = nock(FAKE_PURGE_HOST)
                .intercept(FAKE_PURGE_PATH, 'PURGE')
                .reply(200, {
                    status:'ok',
                    id:'108-1391560174-974124'
                });

            fastlyPurge.url(FAKE_PURGE_URL, { softPurge: false }, function(err, result) {
                assert.ok(!err);
                assert.ok(result);
                assert.strictEqual(result.status, 'ok');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

        it('should purge by surrogate KEY with Fastly API key but NO soft purge header', function(done) {
            var purgePath = '/service/' + FAKE_SERVICE_ID + '/purge/' + FAKE_SURROGATE_KEY;
            var scope = nock(FastlyPurge.FASTLY_API_ENDPOINT)
                .post(purgePath)
                .matchHeader('Fastly-Key', FAKE_API_KEY)
                .matchHeader('Accept', 'application/json')
                .reply(200, {
                    status:'ok'
                });

            fastlyPurge.key(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, { softPurge: false }, function(err, result) {
                assert.ok(!err, err && err.message);
                assert.ok(result);
                assert.strictEqual(result.status, 'ok');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

    });


    describe('override instant purge for soft purge', function() {
        var fastlyPurge = new FastlyPurge(FAKE_API_KEY, { softPurge: false });

        it('should purge URL with Fastly soft purge headers', function(done) {
            var scope = nock(FAKE_PURGE_HOST)
                .intercept(FAKE_PURGE_PATH, 'PURGE')
                .matchHeader('Fastly-Soft-Purge', 1)
                .reply(200, {
                    status:'ok',
                    id:'108-1391560174-974124'
                });

            fastlyPurge.url(FAKE_PURGE_URL, { softPurge: true }, function(err, result) {
                assert.ok(!err);
                assert.ok(result);
                assert.strictEqual(result.status, 'ok');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

        it('should purge by surrogate KEY with Fastly API key and soft purge header', function(done) {
            var purgePath = '/service/' + FAKE_SERVICE_ID + '/purge/' + FAKE_SURROGATE_KEY;
            var scope = nock(FastlyPurge.FASTLY_API_ENDPOINT)
                .post(purgePath)
                .matchHeader('Fastly-Key', FAKE_API_KEY)
                .matchHeader('Fastly-Soft-Purge', 1)
                .matchHeader('Accept', 'application/json')
                .reply(200, {
                    status:'ok'
                });

            fastlyPurge.key(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, { softPurge: true }, function(err, result) {
                assert.ok(!err, err && err.message);
                assert.ok(result);
                assert.strictEqual(result.status, 'ok');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

    });

    describe('errors', function() {
        var fastlyPurge = new FastlyPurge(FAKE_API_KEY);

        it('handle http status error and body', function(done) {
            var purgePath = '/service/' + FAKE_SERVICE_ID + '/purge/' + FAKE_SURROGATE_KEY;
            var scope = nock(FastlyPurge.FASTLY_API_ENDPOINT)
                .post(purgePath)
                .matchHeader('Fastly-Key', FAKE_API_KEY)
                .matchHeader('Accept', 'application/json')
                .reply(503, 'Service Unavailable');

            fastlyPurge.key(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, function(err, result) {
                assert.ok(!result);
                assert.ok(err);
                assert.strictEqual(err.statusCode, 503);
                assert.strictEqual(err.message, 'Service Unavailable');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

        it('handle http status error and fallback body message', function(done) {
            var purgePath = '/service/' + FAKE_SERVICE_ID + '/purge/' + FAKE_SURROGATE_KEY;
            var scope = nock(FastlyPurge.FASTLY_API_ENDPOINT)
                .post(purgePath)
                .matchHeader('Fastly-Key', FAKE_API_KEY)
                .matchHeader('Accept', 'application/json')
                .reply(501);

            fastlyPurge.key(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, function(err, result) {
                assert.ok(!result);
                assert.ok(err);
                assert.strictEqual(err.statusCode, 501);
                assert.strictEqual(err.message, 'Empty response body');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

    });

    describe('json response', function() {
        var fastlyPurge = new FastlyPurge(FAKE_API_KEY);

        it('non application/json content type returns as plain', function(done) {
            var purgePath = '/service/' + FAKE_SERVICE_ID + '/purge/' + FAKE_SURROGATE_KEY;
            var scope = nock(FastlyPurge.FASTLY_API_ENDPOINT)
                .post(purgePath)
                .matchHeader('Fastly-Key', FAKE_API_KEY)
                .matchHeader('Accept', 'application/json')
                .reply(200, '{ "status":"ok" }');

            fastlyPurge.key(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, function(err, result) {
                assert.ok(!err, err && err.message);
                assert.ok(result);
                assert.strictEqual(JSON.parse(result).status, 'ok');
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

        it('invalid application/json content type does fallback to plain', function(done) {
            var invalidJsonString = '{ "status":"ok" ';
            var purgePath = '/service/' + FAKE_SERVICE_ID + '/purge/' + FAKE_SURROGATE_KEY;
            var scope = nock(FastlyPurge.FASTLY_API_ENDPOINT)
                .post(purgePath)
                .matchHeader('Fastly-Key', FAKE_API_KEY)
                .matchHeader('Accept', 'application/json')
                .reply(200, '{ "status":"ok" ', { 'Content-Type': 'application/json' });

            fastlyPurge.key(FAKE_SERVICE_ID, FAKE_SURROGATE_KEY, function(err, result) {
                assert.ok(!err, err && err.message);
                assert.ok(result);
                assert.strictEqual(result, invalidJsonString);
                assert.strictEqual(scope.pendingMocks().length, 0);
                done();
            });
        });

    });

});
