const DOMAIN_REGEX =
  /^(?:[a-z\d\-_]{1,62}\.){0,125}(?:[a-z\d](?:-(?=-*[a-z\d])|[a-z]|\d){0,62}\.)[a-z\d]{1,63}$/i;

const DEFAULTS = {
  imagizerHost: 'examples.cloud.imagizer.com',
  useHttps: true,
};

export interface ImagizerClientOptions {
  imagizerHost?: string;
  useHttps?: boolean;
}

export interface ImagizerClientSettings {
  imagizerHost: string;
  useHttps: boolean;
  urlPrefix: 'http://' | 'https://';
}

export type ImagizerParams = Record<string, unknown>;

export default class ImagizerClient {
  readonly settings: ImagizerClientSettings;

  constructor(opts: ImagizerClientOptions = {}) {
    const settings = { ...DEFAULTS, ...opts };

    if (DOMAIN_REGEX.exec(settings.imagizerHost) == null) {
      throw new Error(
        'Domains must be passed in as fully-qualified ' +
          'domain names and should not include a protocol or any path ' +
          'element, i.e. "example.imagizer.com".',
      );
    }

    this.settings = {
      ...settings,
      urlPrefix: settings.useHttps ? 'https://' : 'http://',
    };
  }

  buildURL(path: string, params: ImagizerParams | null = null, returnRelativeURL = false): string {
    const sanitizedPath = this._sanitizePath(path);
    const queryParams = this._buildParams(params ?? {});
    const relativeURL = sanitizedPath + queryParams;

    if (returnRelativeURL) {
      return relativeURL;
    }

    return this.settings.urlPrefix + this.settings.imagizerHost + relativeURL;
  }

  _sanitizePath(path: string): string {
    let sanitizedPath = path.replace(/^\//, '');

    if (/^https?:\/\//.test(sanitizedPath)) {
      sanitizedPath = encodeURIComponent(sanitizedPath);
    } else {
      sanitizedPath = encodeURI(sanitizedPath);
    }

    return '/' + sanitizedPath;
  }

  _buildParams(params: ImagizerParams): string {
    const queryParams: string[] = [];

    for (const [key, rawValue] of Object.entries(params)) {
      const encodedKey = encodeURIComponent(key);
      let value = rawValue;

      if (key === 'layers' || key === 'layers64') {
        value = JSON.stringify(value);
      }

      const encodedValue = key.endsWith('64')
        ? Buffer.from(String(value), 'utf8').toString('base64url')
        : encodeURIComponent(String(value));

      queryParams.push(`${encodedKey}=${encodedValue}`);
    }

    if (queryParams[0] != null) {
      queryParams[0] = `?${queryParams[0]}`;
    }

    return queryParams.join('&');
  }
}
