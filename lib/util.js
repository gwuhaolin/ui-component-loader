const path = require('path');
// 用于匹配 import { Button } from 'antd';
const importReg = /import\s+{\s*(.+)\s*}\s+from\s+['"](.+)['"]/g;

/**
 * translate ComponentName to component-name | component_name
 * @param componentName
 * @param joinString - or _
 * @returns {string} component-name | component_name
 */
function tranCamel2(componentName, joinString) {
  return componentName.replace(/([a-z])([A-Z])/g, `$1${joinString}$2`).toLowerCase();
}

function replaceImport(source, options = {}) {
  const {
    lib,// lib name
    libDir = 'lib', //lib dir in npm
    style, // style file path
    camel2, // translate ComponentName to component-name | component_name
  } = options;
  if (!lib) {
    return source;
  }
  return source.replace(importReg, function (org, importComponents, importFrom) {
    if (importFrom === lib) {
      importComponents = importComponents.split(',');
      let ret = '';
      importComponents.forEach(function (componentName) {
        componentName = componentName.trim();
        let componentPath = componentName;
        if (camel2) {
          componentPath = tranCamel2(componentName, camel2);
        }

        if (componentName.length > 0) {
          ret += `import ${componentName} from '${path.join(importFrom, libDir, componentPath)}'\n`;

          if (style) {
            ret += `import '${path.join(importFrom, libDir, componentPath, style)}'\n`;
          }
        }
      });
      return ret;
    }
    return org;
  });
}

module.exports = {
  replaceImport,
};