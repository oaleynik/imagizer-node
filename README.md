# imagizer-node

imagizer-node is an npm package that provides the common boilerplate for [Imagizer](https://docs.imagizer.com) server-side JavaScript-based functionality.


## Installing

imagizer-node can be installed as either via npm:

```
$ npm install --save imagizer-node
```


## Usage

``` javascript
const ImagizerClient = require('imagizer-node');

const client = new ImagizerClient({
  // Specify your Imagizer source endpoint
  imagizerHost: 'examples.cloud.imagizer.com',

  // Optionally, use https for secured websites
  useHttps: true,
});

let returnRelativeURL = false;

const url = client.buildURL('/path/to/image.png', {
  w: 400,
  h: 300
}, returnRelativeURL); // returnRelativeURL argument is `false` by default

console.log(url); // => "https://my-social-network.imagizer.com/users/1.png?w=400&h=300&s=…"

returnRelativeURL = true;

const relativeURL = client.buildURL('/path/to/image.png', {
  w: 400,
  h: 300
}, returnRelativeURL);

console.log(relativeURL); // => "/users/1.png?w=400&h=300&s=…"

// ^^^ Useful for layers and watermarks. Also makes base64 encoded layers shorter
```

## Testing

imagizer-node uses mocha for testing. Here’s how to run those tests:

```
npm test
```
