const loaderUtils = require('loader-utils');
const { replaceImport } = require('./util');

module.exports = function (source) {
  this.cacheable();
  const options = loaderUtils.getOptions(this);
  return replaceImport(source, options);
};