const loaderUtils = require('loader-utils');
const { replaceImport } = require('./util');

module.exports = function (source) {
  const options = loaderUtils.getOptions(this);
  return replaceImport(source, options, this.context);
};
