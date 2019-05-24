var assert = require('assert');
var ImagizerClient = require('../src/imagizer-node');
var sinon = require('sinon');

describe('Imagizer client:', function describeSuite() {
  describe('The constructor', function describeSuite() {
    it('initializes with correct defaults', function testSpec() {
      var client = new ImagizerClient({ domains: 'my-host.imagizer.com' });
      assert.equal(client.settings.domains.length, 1);
      assert.equal("my-host.imagizer.com", client.settings.domains[0]);
      assert.equal(void 0, client.settings.secureURLToken);
      assert.equal(true, client.settings.useHTTPS);
    });

    it('initializes with a token', function testSpec() {
      var client = new ImagizerClient({
        domains: 'my-host.imagizer.com',
        secureURLToken: 'MYT0KEN'
      });
      assert.equal(client.settings.domains.length, 1);
      assert.equal("my-host.imagizer.com", client.settings.domains[0]);
      assert.equal("MYT0KEN", client.settings.secureURLToken);
      assert.equal(true, client.settings.useHTTPS);
    });

    it('initializes in insecure mode', function testSpec() {
      var client = new ImagizerClient({
        domains: 'my-host.imagizer.com',
        secureURLToken: 'MYT0KEN',
        useHTTPS: false
      });
      assert.equal(client.settings.domains.length, 1);
      assert.equal("my-host.imagizer.com", client.settings.domains[0]);
      assert.equal("MYT0KEN", client.settings.secureURLToken);
      assert.equal(false, client.settings.useHTTPS);
    });

    it('initializes with domains list', function testSpec() {
      var deprecation_warning = "Warning: Domain sharding has been deprecated and will be removed in the next major version.";
      stub = sinon.stub(console, 'warn').callsFake(function(warning) {
        assert.equal(warning, deprecation_warning);
      });
      var client = new ImagizerClient({
        domains: ['my-host1.imagizer.com', 'my-host2.imagizer.com'],
        secureURLToken: 'MYT0KEN',
        useHTTPS: false
      });
      assert.equal(client.settings.domains.length, 2);
      assert.equal("my-host1.imagizer.com", client.settings.domains[0]);
      assert.equal("my-host2.imagizer.com", client.settings.domains[1]);
      assert.equal("MYT0KEN", client.settings.secureURLToken);
      assert.equal(false, client.settings.useHTTPS);
      stub.restore();
    });

    it('errors with invalid domain - appended slash', function testSpec() {
      assert.throws(function() {
        new ImagizerClient({
          domains: ['my-host1.imagizer.com/'],
        })
      }, Error);
      stub.restore();
    });

    it('errors with invalid domain - prepended scheme ', function testSpec() {
      var deprecation_warning = "Warning: Domain sharding has been deprecated and will be removed in the next major version.";
      var stub = sinon.stub(console, 'warn').callsFake(function(warning) {
        assert.equal(warning, deprecation_warning);
      });
      assert.throws(function() {
        new ImagizerClient({
          domains: ['https://my-host1.imagizer.com'],
        })
      }, Error);
      stub.restore();
    });

    it('errors with invalid domain - appended dash ', function testSpec() {
      var deprecation_warning = "Warning: Domain sharding has been deprecated and will be removed in the next major version.";
      var stub = sinon.stub(console, 'warn').callsFake(function(warning) {
        assert.equal(warning, deprecation_warning);
      });
      assert.throws(function() {
        new ImagizerClient({
          domains: ['my-host1.imagizer.com-'],
        })
      }, Error);
      stub.restore();
    });
  });

  describe('Calling _sanitizePath()', function describeSuite() {
    var client;

    beforeEach(function setupClient() {
      client = new ImagizerClient({
        domains: 'testing.imagizer.com'
      });
    });

    describe('with a simple path', function describeSuite() {
      var path = 'images/1.png';

      it('prepends a leading slash', function testSpec() {
        var expectation = '/',
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(0, 1));
      });

      it('otherwise returns the same exact path', function testSpec() {
        var expectation = path,
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(1));
      });
    });

    describe('with a path that contains a leading slash', function describeSuite() {
      var path = '/images/1.png';

      it('retains the leading slash', function testSpec() {
        var expectation = '/',
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(0, 1));
      });

      it('otherwise returns the same exact path', function testSpec() {
        var expectation = path.substr(1),
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(1));
      });
    });

    describe('with a path that contains unencoded characters', function describeSuite() {
      var path = 'images/"image 1".png';

      it('prepends a leading slash', function testSpec() {
        var expectation = '/',
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(0, 1));
      });

      it('otherwise returns the same path, except with the characters encoded properly', function testSpec() {
        var expectation = encodeURI(path),
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(1));
      });
    });

    describe('with a full HTTP URL', function describeSuite() {
      var path = 'http://example.com/images/1.png';

      it('prepends a leading slash, unencoded', function testSpec() {
        var expectation = '/',
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(0, 1));
      });

      it('otherwise returns a fully-encoded version of the given URL', function testSpec() {
        var expectation = encodeURIComponent(path),
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(1));
      });
    });

    describe('with a full HTTPS URL', function describeSuite() {
      var path = 'https://example.com/images/1.png';

      it('prepends a leading slash, unencoded', function testSpec() {
        var expectation = '/',
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(0, 1));
      });

      it('otherwise returns a fully-encoded version of the given URL', function testSpec() {
        var expectation = encodeURIComponent(path),
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(1));
      });
    });

    describe('with a full URL that contains a leading slash', function describeSuite() {
      var path = '/http://example.com/images/1.png';

      it('retains the leading slash, unencoded', function testSpec() {
        var expectation = '/',
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(0, 1));
      });

      it('otherwise returns a fully-encoded version of the given URL', function testSpec() {
        var expectation = encodeURIComponent(path.substr(1)),
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(1));
      });
    });

    describe('with a full URL that contains encoded characters', function describeSuite() {
      var path = 'http://example.com/images/1.png?foo=%20';

      it('prepends a leading slash, unencoded', function testSpec() {
        var expectation = '/',
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(0, 1));
      });

      it('otherwise returns a fully-encoded version of the given URL', function testSpec() {
        var expectation = encodeURIComponent(path),
            result = client._sanitizePath(path);

        assert.equal(expectation, result.substr(1));
      });

      it('double-encodes the original encoded characters', function testSpec() {
        var expectation1 = -1,
            expectation2 = encodeURIComponent(path).length - 4;
            result = client._sanitizePath(path);

        // Result should not contain the string "%20"
        assert.equal(expectation1, result.indexOf('%20'));

        // Result should instead contain the string "%2520"
        assert.equal(expectation2, result.indexOf('%2520'));
      });
    });
  });

  describe('Calling _buildParams()', function describeSuite() {
    var client;

    beforeEach(function setupClient() {
      client = new ImagizerClient({
        domains: 'testing.imagizer.com',
        includeLibraryParam: false
      });
    });

    it('returns an empty string if no parameters are given', function testSpec() {
      var params = {},
          expectation = '',
          result = client._buildParams(params);

      assert.equal(expectation, result);
    });

    it('returns a properly-formatted query string if a single parameter is given', function testSpec() {
      var params = {
              w: 400
            },
          expectation = '?w=400',
          result = client._buildParams(params);

      assert.equal(expectation, result);
    });

    it('returns a properly-formatted query string if multiple parameters are given', function testSpec() {
      var params = {
              w: 400,
              h: 300
            },
          expectation = '?w=400&h=300',
          result = client._buildParams(params);

      assert.equal(expectation, result);
    });

    it('url-encodes parameter keys properly', function testSpec() {
      var params = {
              'w$': 400
            },
          expectation = '?w%24=400',
          result = client._buildParams(params);

      assert.equal(expectation, result);
    });

    it('url-encodes parameter values properly', function testSpec() {
      var params = {
              w: '$400'
            },
          expectation = '?w=%24400',
          result = client._buildParams(params);

      assert.equal(expectation, result);
    });
  });
});
