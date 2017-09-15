const loaderUtils = require('loader-utils');

// 用于匹配 import { Button } from 'antd';
const importReg = /import\s+{\s*(.+)\s*}\s+from\s+['"](.+)['"]/g;

// 把 myStr 转化为 my-str
function camelCaseToDash(myStr) {
  return myStr.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

module.exports = function (source) {
  this.cacheable();

  // 获得参数
  const {
    libraryName,
    libraryDirectory = 'lib',
    camel2DashComponentName = false,
    style
  } = loaderUtils.getOptions(this);

  source = source.replace(importReg, function (org, list, lib) {
    if (lib === libraryName) {
      list = list.split(',');
      let ret = '';
      list.forEach(function (component) {
        component = component.trim();

        if (camel2DashComponentName) {
          component = camelCaseToDash(component);
        }

        if (component.length > 0) {
          ret += `var ${component} = require('${lib}/lib/${component}');\n`;

          if (style) {
            ret += `require('${lib}/${libraryDirectory}/${component}/style/index.${style}');\n`;
          }
        }
      });
      return ret;
    }
    return org;
  });
  return source;
};