# imagizer-node

`imagizer-node` is a small ESM client for building [Imagizer](https://docs.imagizer.com) image URLs on the server.

It takes an image path plus transformation parameters and returns either:

- a full Imagizer URL such as `https://example.cloud.imagizer.com/path/to/image.jpg?w=400`
- a relative URL such as `/path/to/image.jpg?w=400`

That makes it useful for generating transformed image URLs in Node.js applications, background jobs, templates, and APIs.

## Installing

Install the package with your preferred package manager:

```
pnpm add imagizer-node
```

```bash
npm install imagizer-node
```

Node `>=20.19.0` is required.

This package is ESM-only.

## Usage

```javascript
import ImagizerClient from 'imagizer-node';

const client = new ImagizerClient({
  imagizerHost: 'media.example.imagizer.com',
  useHttps: true,
});

const url = client.buildURL('/products/chair.png', {
  w: 400,
  h: 300,
  crop: 'fit',
});

console.log(url);
// => 'https://media.example.imagizer.com/products/chair.png?w=400&h=300&crop=fit'
```

## API

### `new ImagizerClient(options)`

Creates a client bound to your Imagizer host.

Supported options:

- `imagizerHost`: fully qualified Imagizer hostname, without protocol or path
- `useHttps`: whether generated full URLs should use `https://` or `http://`; defaults to `true`

Example:

```javascript
const client = new ImagizerClient({
  imagizerHost: 'media.example.imagizer.com',
  useHttps: false,
});
```

### `client.buildURL(path, params?, returnRelativeURL?)`

Builds a URL from an image path and an optional parameter object.

- `path`: image path or absolute `http://` / `https://` URL
- `params`: transformation parameters to serialize into the query string
- `returnRelativeURL`: when `true`, returns only the relative path and query; defaults to `false`

## Examples

### Relative URLs

Relative URLs are useful when you want to embed generated image paths into other Imagizer features such as layers or watermarks.

```javascript
const client = new ImagizerClient({
  imagizerHost: 'media.example.imagizer.com',
});

const relativeURL = client.buildURL(
  '/products/chair.png',
  {
    w: 400,
    h: 300,
  },
  true,
);

console.log(relativeURL);
// => '/products/chair.png?w=400&h=300'
```

### External image URLs as input

If you pass a full source URL as the `path`, `imagizer-node` percent-encodes it before building the final Imagizer URL.

```javascript
const client = new ImagizerClient({
  imagizerHost: 'media.example.imagizer.com',
});

const url = client.buildURL('https://cdn.example.com/assets/chair.png', {
  w: 800,
});

console.log(url);
// => 'https://media.example.imagizer.com/https%3A%2F%2Fcdn.example.com%2Fassets%2Fchair.png?w=800'
```

### `layers` and `layers64`

The client JSON-serializes `layers` and `layers64` automatically. Keys ending in `64` are base64url-encoded.

```javascript
const url = client.buildURL('/products/chair.png', {
  layers64: [
    {
      url: '/watermarks/logo.png',
      pos: 'bottom|right',
      scale: 40,
    },
  ],
});
```

## Development

```bash
pnpm format
pnpm lint
pnpm test
pnpm build
```

## Reference

Imagizer API documentation: <https://docs.imagizer.com/api_reference/>
