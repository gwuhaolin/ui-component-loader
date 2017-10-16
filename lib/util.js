const path = require('path');
const {existsSync} = require('fs');
// 用于匹配 import { Button } from 'antd';
const importReg = /import\s+{\s*(.+)\s*}\s+from\s+['"](.+)['"]/g;

/**
 * translate ComponentName to component-name | component_name
 * @param componentName
 * @param joinString - or _
 * @returns {string} component-name | component_name
 */
function tranCamel2(componentName, joinString) {
  if (typeof joinString === "string") {
    return componentName.replace(/([a-z])([A-Z])/g, `$1${joinString}$2`).toLowerCase();
  }
  return componentName;
}

/**
 * file exists in node_modules?
 * @param filePath
 */
function fileExistInNpm(filePath) {
  return existsSync(path.resolve(__dirname, '../../', filePath));
}

function replaceImport(source, options = {}) {
  const {
    lib,// lib name
    libDir = 'lib', //lib dir in npm
    style, // style file path
    camel2, // translate ComponentName to component-name | component_name
    existCheck = fileExistInNpm, // only import file when exits
    componentDirMap = {}, // used to map a ComponentName to ComponentEntryPath in lib
  } = options;
  if (!lib) {
    return source;
  }
  return source.replace(importReg, function (org, importComponents, importFrom) {
    if (importFrom === lib) {
      // 需要导入的组件列表
      importComponents = importComponents.split(',');
      let ret = '';
      importComponents.forEach(function (componentName) {
        // 如果组件名称为空就直接忽略
        componentName = componentName.trim();
        if (componentName.length === 0) {
          return
        }

        // 组件的入口目录路径
        let componentDirPath;

        if (typeof componentDirMap[componentName] === "string") {
          // 如果在 map 配置了针对这个组件名称的入口目录映射，就优先采用映射
          componentDirPath = path.join(importFrom, libDir, componentDirMap[componentName]);
        } else {
          componentDirPath = path.join(importFrom, libDir, tranCamel2(componentName, camel2));
        }

        // 导入组件入口 JS 文件
        if (typeof existCheck !== 'function' || existCheck(componentDirPath)) {
          ret += `import ${componentName} from '${componentDirPath}';`;
        }

        // 导入组件 CSS 入口文件
        if (style) {
          const styleFilePath = path.join(componentDirPath, style);
          if (typeof existCheck !== 'function' || existCheck(styleFilePath)) {
            ret += `import '${styleFilePath}';`;
          }
        }
      });
      return ret;
    } else {
      return org;
    }
  });
}

module.exports = {
  replaceImport,
};