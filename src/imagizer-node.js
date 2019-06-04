const Base64 = require('js-base64').Base64;

const DOMAIN_REGEX = /^(?:[a-z\d\-_]{1,62}\.){0,125}(?:[a-z\d](?:-(?=-*[a-z\d])|[a-z]|\d){0,62}\.)[a-z\d]{1,63}$/i;

const DEFAULTS = {
  imagizerHost: 'examples.cloud.imagizer.com',
  useHttps: true,
};

class ImagizerClient {
  constructor (opts = {}) {
    this.settings = { ...DEFAULTS, ...opts };
    this.settings.urlPrefix = this.settings.useHttps ? 'https://' : 'http://';

    if (DOMAIN_REGEX.exec(this.settings.imagizerHost) == null) {
      throw new Error(
        'Domains must be passed in as fully-qualified ' +
        'domain names and should not include a protocol or any path ' +
        'element, i.e. "example.imagizer.com".');
    }
  }

  buildURL (path, params, returnRelativeURL = false) {
    path = this._sanitizePath(path);

    if (params == null) params = {};

    let queryParams = this._buildParams(params);
    let relativeURL = path + queryParams;

    if (returnRelativeURL) return relativeURL;

    return this.settings.urlPrefix + this.settings.imagizerHost + relativeURL;
  }

  _sanitizePath (path) {
    path = path.replace(/^\//, '');

    if (/^https?:\/\//.test(path)) {
      path = encodeURIComponent(path);
    } else {
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

      if (key === 'layers' || key === 'layers64') {
        val = JSON.stringify(val);
      }

      if (key.substr(-2) === '64') {
        encodedVal = Base64.encodeURI(val);
      } else {
        encodedVal = encodeURIComponent(val);
      }

      queryParams.push(encodedKey + '=' + encodedVal);
    }

    if (queryParams[0]) {
      queryParams[0] = '?' + queryParams[0];
    }

    return queryParams.join('&');
  }
}

module.exports = ImagizerClient;
