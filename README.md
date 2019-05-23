# imagizer-node

imagizer-node is an npm package that provides the common boilerplate for [Imagizer](https://docs.imagizer.com) server-side JavaScript-based functionality.


## Installing

imagizer-node can be installed as either via npm:

```
$ npm install --save imagizer-node
```


## Usage

Depending on your module system, using imagizer-node is done a few different ways. The most common entry point will be the `Client` class. Whenever you provide data to imagizer-node, make sure it is not already URL-encoded, as the library handles proper encoding internally.

### CommonJS

``` javascript
var ImagizerClient = require('imagizer-node');

var client = new ImagizerClient({
  // Specify your Imagizer source endpoint
  imagizerHost: 'examples.cloud.imagizer.com',

  // Optionally, use https for secured websites
  useHttps: true,

  // Optionally, enable Auto device pixel ratio setting.
  // Device pixel ratio will now be detected
  // and automatically applied to image urls
  // https://docs.imagizer.com/api_reference/#dpr
  autoDpr: true,

  // Optionally, compress our images by setting the global quality
  // https://docs.imagizer.com/api_reference/#quality
  quality: 60,

  // Optionally, use best format that's supported by the browser
  // (webp, jpg, png)
  // https://docs.imagizer.com/api_reference/#auto
  format: 'auto',
  domains: 'my-source.imagizer.com',
  secureURLToken: '<SECURE TOKEN>',
});

var url = client.buildURL('/path/to/image.png', {
  w: 400,
  h: 300
});

console.log(url); // => "https://my-social-network.imagizer.com/users/1.png?w=400&h=300&s=…"
```

### ES6 Modules

``` javascript
import ImagizerClient from 'imagizer-node'

let client = new ImagizerClient({
  domains: 'my-source.imagizer.com',
  secureURLToken: '<SECURE TOKEN>',
});

let url = client.buildURL('/path/to/image.png', { w: 400, h: 300 });
console.log(url); // => 'https://my-social-network.imagizer.com/users/1.png?w=400&h=300&s=…'
```


## Testing

imagizer-node uses mocha for testing. Here’s how to run those tests:

```
npm test
```
