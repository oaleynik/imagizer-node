const VERSION = '1.0.0';
const DOMAIN_REGEX = /^(?:[a-z\d\-_]{1,62}\.){0,125}(?:[a-z\d](?:-(?=-*[a-z\d])|[a-z]|\d){0,62}\.)[a-z\d]{1,63}$/i;

const DEFAULTS = {
  domains: [],
  useHTTPS: true,
};

class ImagizerClient {
  constructor (opts = {}) {
    this.settings = { ...DEFAULTS, ...opts };
    this.settings.urlPrefix = this.settings.useHTTPS ? 'https://' : 'http://';

    if (!Array.isArray(this.settings.domains)) {
      this.settings.domains = [this.settings.domains];
    }

    this.settings.domains.forEach(domain => {
      if (DOMAIN_REGEX.exec(domain) == null) {
        throw new Error(
          'Domains must be passed in as fully-qualified ' +
          'domain names and should not include a protocol or any path ' +
          'element, i.e. "example.imagizer.com".');
      }
    });
  }

  buildURL (path, params) {
    path = this._sanitizePath(path);

    if (params == null) {
      params = {};
    }

    let queryParams = this._buildParams(params);

    return this.settings.urlPrefix + this._getDomain(path) + path + queryParams;
  }

  _getDomain () {
    return this.settings.domains[0];
  }

  _sanitizePath (path) {
    // Strip leading slash first (we'll re-add after encoding)
    path = path.replace(/^\//, '');

    if (/^https?:\/\//.test(path)) {
      // Use de/encodeURIComponent to ensure *all* characters are handled,
      // since it's being used as a path
      path = encodeURIComponent(path);
    } else {
      // Use de/encodeURI if we think the path is just a path,
      // so it leaves legal characters like '/' and '@' alone
      path = encodeURI(path);
    }

    return '/' + path;
  }

  _buildParams (params) {
    let queryParams = [];
    let key;
    let val;
    let encodedKey;
    let encodedVal;

    for (key in params) {
      val = params[key];
      encodedKey = encodeURIComponent(key);
      encodedVal = encodeURIComponent(val);

      queryParams.push(encodedKey + '=' + encodedVal);
    }

    if (queryParams[0]) {
      queryParams[0] = '?' + queryParams[0];
    }

    return queryParams.join('&');
  }
}

ImagizerClient.VERSION = VERSION;

module.exports = ImagizerClient;
