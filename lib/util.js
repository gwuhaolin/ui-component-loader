const path = require('path');
const {existsSync} = require('fs');
// 用于匹配 import { Button } from 'antd';
const importReg = /import\s+{\s*([A-Za-z0-9,\n/\\* ]+)\s*}\s+from\s+['"](\S+)['"];?/g;

/**
 * translate ComponentName to component-name | component_name
 * @param componentName
 * @param joinString - or _
 * @returns {string} component-name | component_name
 */
function tranCamel2(componentName, joinString) {
  if (typeof joinString === 'string') {
    return componentName.replace(/([a-z])([A-Z])/g, `$1${joinString}$2`).toLowerCase();
  }
  return componentName;
}

/**
 * replace backward slash (\) with forward slash (/)
 * @param {string} filePath path
 */
function winPath(filePath) {
  // for windows
  if (process.platform === 'win32') {
    return filePath.replace(/\\/g, '/');
  }
  return filePath;
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
      importComponents = removeComment(importComponents).split(',');
      let ret = '';
      importComponents.forEach(function (componentName) {
        // 如果组件名称为空就直接忽略
        componentName = componentName.trim();
        if (componentName.length === 0) {
          return
        }

        // 组件的入口目录路径
        let componentDirPath;

        if (typeof componentDirMap[componentName] === 'string') {
          // 如果在 map 配置了针对这个组件名称的入口目录映射，就优先采用映射
          componentDirPath = path.join(importFrom, libDir, componentDirMap[componentName]);
        } else {
          componentDirPath = path.join(importFrom, libDir, tranCamel2(componentName, camel2));
        }

        // 当文件存在时才导入
        if (existCheck(componentDirPath)) {
          // 导入组件入口 JS 文件
          ret += `import ${componentName} from '${componentDirPath}';`;
          if (style) {
            // style 文件入口
            const styleFilePath = path.join(componentDirPath, style);
            if (existCheck(styleFilePath)) {
              // 导入组件 CSS 入口文件
              ret += `import '${styleFilePath}';`;
            }
          }
        }
      });
      return winPath(ret);
    } else {
      return org;
    }
  });
}

// 删除JS代码中的注释
function removeComment(sourceCode){
  return sourceCode.replace(/\/\/.*\n/g,'').replace(/\/\*(\s|.)*\*\//g,'')
}

module.exports = {
  replaceImport,
  removeComment,
  tranCamel2,
};
