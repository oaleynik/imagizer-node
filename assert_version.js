var packageVersion = require('./package').version;
var distVersion = require('./dist/imagizer-node').VERSION;

if (packageVersion === distVersion) {
  return 0;
} else {
  process.stdout.write("FAIL: package.json and lib/imagizer-node.js versions do not match!\n");
  return 1;
}
