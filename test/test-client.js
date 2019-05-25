var assert = require('assert');
var ImagizerClient = require('../src/imagizer-node');

describe('Imagizer client:', function describeSuite() {
  describe('The constructor', function describeSuite() {
    it('initializes with correct defaults', function testSpec() {
      var client = new ImagizerClient({ imagizerHost: 'my-host.imagizer.com' });
      assert.equal("my-host.imagizer.com", client.settings.imagizerHost);
      assert.equal(true, client.settings.useHttps);
    });

    it('initializes in insecure mode', function testSpec() {
      var client = new ImagizerClient({
        imagizerHost: 'my-host.imagizer.com',
        useHttps: false
      });
      assert.equal("my-host.imagizer.com", client.settings.imagizerHost);
      assert.equal(false, client.settings.useHttps);
    });

    it('errors with invalid domain - appended slash', function testSpec() {
      assert.throws(function() {
        new ImagizerClient({
          imagizerHost: 'my-host1.imagizer.com/',
        })
      }, Error);
    });

    it('errors with invalid domain - prepended scheme ', function testSpec() {
      assert.throws(function() {
        new ImagizerClient({
          imagizerHost: 'https://my-host1.imagizer.com',
        })
      }, Error);
    });

    it('errors with invalid domain - appended dash ', function testSpec() {
      assert.throws(function() {
        new ImagizerClient({
          imagizerHost: 'my-host1.imagizer.com-',
        })
      }, Error);
    });
  });

  describe('Calling _sanitizePath()', function describeSuite() {
    var client;

    beforeEach(function setupClient() {
      client = new ImagizerClient({
        imagizerHost: 'testing.imagizer.com'
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
        imagizerHost: 'testing.imagizer.com'
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

    it('url-encodes `layers` parameter properly', function testSpec() {
      var params = {
        layers: [
          {
            url: '/image-trans.png',
            pos: 'top|left',
            alpha: 75,
            angle: 45,
            offset: 15,
            scale: 30
          },
          {
            url: '/image-trans.png',
            pos: 'bottom|right',
            alpha: 100,
            angle: 250,
            offset: 35,
            scale: 75,
            upscale: false
          }
        ],
      };

      var expectation = '?layers=%5B%7B%22url%22%3A%22%2Fimage-trans.png%22%2C%22pos%22%3A%22top%7Cleft%22%2C%22alpha%22%3A75%2C%22angle%22%3A45%2C%22offset%22%3A15%2C%22scale%22%3A30%7D%2C%7B%22url%22%3A%22%2Fimage-trans.png%22%2C%22pos%22%3A%22bottom%7Cright%22%2C%22alpha%22%3A100%2C%22angle%22%3A250%2C%22offset%22%3A35%2C%22scale%22%3A75%2C%22upscale%22%3Afalse%7D%5D';
      var result = client._buildParams(params);

      assert.equal(expectation, result);
    });

    it('base64-encodes parameter properly with "64" postfix', function testSpec() {
      var params = {
        layers64: [
          {
            url: '/ishack.pro-east/images/img902/cv7npf.jpg',
            scale: 85,
          },
          {
            url: '/ishack.pro-east/images/img902/cv7npf.jpg',
            scale: 70,
          },
          {
            url: '/ishack.pro-east/images/img902/cv7npf.jpg',
            scale: 55,
          },
          {
            url: '/ishack.pro-east/images/img902/cv7npf.jpg',
            scale: 40,
          }
        ],
      };

      var expectation = '?layers64=W3sidXJsIjoiL2lzaGFjay5wcm8tZWFzdC9pbWFnZXMvaW1nOTAyL2N2N25wZi5qcGciLCJzY2FsZSI6ODV9LHsidXJsIjoiL2lzaGFjay5wcm8tZWFzdC9pbWFnZXMvaW1nOTAyL2N2N25wZi5qcGciLCJzY2FsZSI6NzB9LHsidXJsIjoiL2lzaGFjay5wcm8tZWFzdC9pbWFnZXMvaW1nOTAyL2N2N25wZi5qcGciLCJzY2FsZSI6NTV9LHsidXJsIjoiL2lzaGFjay5wcm8tZWFzdC9pbWFnZXMvaW1nOTAyL2N2N25wZi5qcGciLCJzY2FsZSI6NDB9XQ';
      var result = client._buildParams(params);

      assert.equal(expectation, result);
    });
  });
});
