import { beforeEach, describe, expect, it } from 'vitest';

import ImagizerClient from '../src/index';

describe('Imagizer client', () => {
  describe('constructor', () => {
    it('initializes with correct defaults', () => {
      const client = new ImagizerClient({ imagizerHost: 'my-host.imagizer.com' });

      expect(client.settings.imagizerHost).toBe('my-host.imagizer.com');
      expect(client.settings.useHttps).toBe(true);
      expect(client.settings.urlPrefix).toBe('https://');
    });

    it('initializes in insecure mode', () => {
      const client = new ImagizerClient({
        imagizerHost: 'my-host.imagizer.com',
        useHttps: false,
      });

      expect(client.settings.imagizerHost).toBe('my-host.imagizer.com');
      expect(client.settings.useHttps).toBe(false);
      expect(client.settings.urlPrefix).toBe('http://');
    });

    it('errors with an appended slash in the domain', () => {
      expect(() => {
        new ImagizerClient({ imagizerHost: 'my-host1.imagizer.com/' });
      }).toThrow(Error);
    });

    it('errors with a prepended scheme in the domain', () => {
      expect(() => {
        new ImagizerClient({ imagizerHost: 'https://my-host1.imagizer.com' });
      }).toThrow(Error);
    });

    it('errors with an appended dash in the domain', () => {
      expect(() => {
        new ImagizerClient({ imagizerHost: 'my-host1.imagizer.com-' });
      }).toThrow(Error);
    });
  });

  describe('_sanitizePath()', () => {
    let client: ImagizerClient;

    beforeEach(() => {
      client = new ImagizerClient({ imagizerHost: 'testing.imagizer.com' });
    });

    it('prepends a leading slash to a simple path', () => {
      const result = client._sanitizePath('images/1.png');

      expect(result.startsWith('/')).toBe(true);
      expect(result.slice(1)).toBe('images/1.png');
    });

    it('retains a single leading slash when one is already present', () => {
      const result = client._sanitizePath('/images/1.png');

      expect(result.startsWith('/')).toBe(true);
      expect(result.slice(1)).toBe('images/1.png');
    });

    it('encodes unencoded characters in a relative path', () => {
      const path = 'images/"image 1".png';
      const result = client._sanitizePath(path);

      expect(result.startsWith('/')).toBe(true);
      expect(result.slice(1)).toBe(encodeURI(path));
    });

    it('fully encodes an http URL path', () => {
      const path = 'http://example.com/images/1.png';
      const result = client._sanitizePath(path);

      expect(result.startsWith('/')).toBe(true);
      expect(result.slice(1)).toBe(encodeURIComponent(path));
    });

    it('fully encodes an https URL path', () => {
      const path = 'https://example.com/images/1.png';
      const result = client._sanitizePath(path);

      expect(result.startsWith('/')).toBe(true);
      expect(result.slice(1)).toBe(encodeURIComponent(path));
    });

    it('fully encodes a URL path that starts with a slash', () => {
      const path = '/http://example.com/images/1.png';
      const result = client._sanitizePath(path);

      expect(result.startsWith('/')).toBe(true);
      expect(result.slice(1)).toBe(encodeURIComponent(path.slice(1)));
    });

    it('double-encodes already-encoded characters in full URLs', () => {
      const path = 'http://example.com/images/1.png?foo=%20';
      const result = client._sanitizePath(path);

      expect(result.startsWith('/')).toBe(true);
      expect(result.slice(1)).toBe(encodeURIComponent(path));
      expect(result.includes('%20')).toBe(false);
      expect(result.indexOf('%2520')).toBe(encodeURIComponent(path).length - 4);
    });
  });

  describe('_buildParams()', () => {
    let client: ImagizerClient;

    beforeEach(() => {
      client = new ImagizerClient({ imagizerHost: 'testing.imagizer.com' });
    });

    it('returns an empty string if no parameters are given', () => {
      expect(client._buildParams({})).toBe('');
    });

    it('returns a properly formatted query string for a single parameter', () => {
      expect(client._buildParams({ w: 400 })).toBe('?w=400');
    });

    it('returns a properly formatted query string for multiple parameters', () => {
      expect(client._buildParams({ w: 400, h: 300 })).toBe('?w=400&h=300');
    });

    it('encodes parameter keys properly', () => {
      expect(client._buildParams({ w$: 400 })).toBe('?w%24=400');
    });

    it('encodes parameter values properly', () => {
      expect(client._buildParams({ w: '$400' })).toBe('?w=%24400');
    });

    it('encodes the layers parameter properly', () => {
      const params = {
        layers: [
          {
            url: '/image-trans.png',
            pos: 'top|left',
            alpha: 75,
            angle: 45,
            offset: 15,
            scale: 30,
          },
          {
            url: '/image-trans.png',
            pos: 'bottom|right',
            alpha: 100,
            angle: 250,
            offset: 35,
            scale: 75,
            upscale: false,
          },
        ],
      };

      expect(client._buildParams(params)).toBe(
        '?layers=%5B%7B%22url%22%3A%22%2Fimage-trans.png%22%2C%22pos%22%3A%22top%7Cleft%22%2C%22alpha%22%3A75%2C%22angle%22%3A45%2C%22offset%22%3A15%2C%22scale%22%3A30%7D%2C%7B%22url%22%3A%22%2Fimage-trans.png%22%2C%22pos%22%3A%22bottom%7Cright%22%2C%22alpha%22%3A100%2C%22angle%22%3A250%2C%22offset%22%3A35%2C%22scale%22%3A75%2C%22upscale%22%3Afalse%7D%5D',
      );
    });

    it('base64url-encodes parameters with a 64 postfix', () => {
      const params = {
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
          },
        ],
      };

      expect(client._buildParams(params)).toBe(
        '?layers64=W3sidXJsIjoiL2lzaGFjay5wcm8tZWFzdC9pbWFnZXMvaW1nOTAyL2N2N25wZi5qcGciLCJzY2FsZSI6ODV9LHsidXJsIjoiL2lzaGFjay5wcm8tZWFzdC9pbWFnZXMvaW1nOTAyL2N2N25wZi5qcGciLCJzY2FsZSI6NzB9LHsidXJsIjoiL2lzaGFjay5wcm8tZWFzdC9pbWFnZXMvaW1nOTAyL2N2N25wZi5qcGciLCJzY2FsZSI6NTV9LHsidXJsIjoiL2lzaGFjay5wcm8tZWFzdC9pbWFnZXMvaW1nOTAyL2N2N25wZi5qcGciLCJzY2FsZSI6NDB9XQ',
      );
    });
  });

  describe('buildURL()', () => {
    let client: ImagizerClient;

    beforeEach(() => {
      client = new ImagizerClient({ imagizerHost: 'testing.imagizer.com' });
    });

    it('returns a relative URL when requested', () => {
      const result = client.buildURL('/path/to/example.jpg', { w: 600, crop: 'fit' }, true);

      expect(result).toBe('/path/to/example.jpg?w=600&crop=fit');
    });

    it('returns a full URL by default', () => {
      const result = client.buildURL('/path/to/example.jpg', { w: 600, crop: 'fit' });

      expect(result).toBe('https://testing.imagizer.com/path/to/example.jpg?w=600&crop=fit');
    });
  });
});
