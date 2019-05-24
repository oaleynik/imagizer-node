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
});

const url = client.buildURL('/path/to/image.png', {
  w: 400,
  h: 300
});

console.log(url); // => "https://my-social-network.imagizer.com/users/1.png?w=400&h=300&s=…"
```


## Testing

imagizer-node uses mocha for testing. Here’s how to run those tests:

```
npm test
```
