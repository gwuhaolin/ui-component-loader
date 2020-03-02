const path = require("path");
const fs = require("fs");
// 用于匹配 import { Button } from 'antd';
const importReg = /import\s+{\s*([A-Za-z0-9,\n/\\* ]+)\s*}\s+from\s+['"](\S+)['"];?/g;

/**
 * translate ComponentName to component-name | component_name
 * @param componentName
 * @param joinString - or _
 * @returns {string} component-name | component_name
 */
function tranCamel2(componentName, joinString) {
  if (typeof joinString === "string") {
    return componentName
      .replace(/([a-z])([A-Z])/g, `$1${joinString}$2`)
      .toLowerCase();
  }
  return componentName;
}

/**
 * replace backward slash (\) with forward slash (/)
 * @param {string} filePath path
 */
function winPath(filePath) {
  // for windows
  if (process.platform === "win32") {
    return filePath.replace(/\\/g, "/");
  }
  return filePath;
}

function resolveNodeModule(moduleName, context) {
  let ret = path.resolve(context, "node_modules", moduleName);
  if (fs.existsSync(ret)) {
    return ret;
  } else {
    return resolveNodeModule(moduleName, path.resolve(context, '..'))
  }
}

/**
 * file exists in node_modules?
 */
function fileExistInNpm(moduleName, filePath, context) {
  const p = path.resolve(resolveNodeModule(moduleName, context), filePath);
  return fs.existsSync(p) || fs.existsSync(p + '.js');
}

// 从需要按需加载的npm包的根目录读取ui-component-loader.json文件作为该包的componentDirMap配置
function getComponentDirMap(libName, context) {
  const modulePath = resolveNodeModule(libName, context);
  if (!modulePath) {
    return {};
  }
  const mapFilePath = path.resolve(modulePath, `ui-component-loader.json`);
  if (fs.existsSync(mapFilePath)) {
    return require(mapFilePath);
  }
  return {};
}

// 从用户传入的options中获取指定包名的配置，如果该包没有对应的配置就访问空
function getOptionForLib(libName, options) {
  if (!libName || !options) {
    return;
  }
  let ret = options[libName];
  if (typeof ret === "object" && ret != null) {
    return Object.assign(
      {
        lib: libName
      },
      ret
    );
  }
  if (options.lib === libName) {
    return options;
  }
}

function replaceImport(source, options = {}, context) {
  return source.replace(importReg, function(org, importComponents, importFrom) {
    const option = getOptionForLib(importFrom, options);
    if (!option) {
      // 该包没有配置，不做转换处理
      return org;
    }
    const {
      lib, // lib name
      libPolyfill,
      libDir = "lib", //lib dir in npm
      style, // style file path
      camel2, // translate ComponentName to component-name | component_name
      existCheck = fileExistInNpm, // only import file when exits
      componentDirMap = getComponentDirMap(lib, context) // used to map a ComponentName to ComponentEntryPath in lib
    } = option;
    // 需要导入的组件列表
    importComponents = removeComment(importComponents).split(",");
    let ret = "";
    importComponents.forEach(function(componentName) {
      // 如果组件名称为空就直接忽略
      componentName = componentName.trim();
      if (componentName.length === 0) {
        return;
      }

      // 组件的入口目录路径
      let componentDirPath;

      if (typeof componentDirMap[componentName] === "string") {
        // 如果在 map 配置了针对这个组件名称的入口目录映射，就优先采用映射
        componentDirPath = path.join(libDir, componentDirMap[componentName]);
      } else {
        componentDirPath = path.join(libDir, tranCamel2(componentName, camel2));
      }

      function injectComponent(importFrom) {
        // 当文件存在时才导入
        // 导入组件入口 JS 文件
        ret += `import ${componentName} from '${path.join(
          importFrom,
          componentDirPath
        )}';`;
        if (style) {
          // style 文件入口
          const styleFilePath = path.join(componentDirPath, style);
          if (existCheck(importFrom, styleFilePath, context)) {
            // 导入组件 CSS 入口文件
            ret += `import '${path.join(
              importFrom,
              styleFilePath
            )}';`;
          }
        }
      }

      if (existCheck(importFrom, componentDirPath, context)) {
        injectComponent(importFrom);
      } else if (libPolyfill && existCheck(libPolyfill, componentDirPath, context)) {
        injectComponent(libPolyfill);
      }
    });
    return winPath(ret);
  });
}

// 删除JS代码中的注释
function removeComment(sourceCode) {
  return sourceCode.replace(/\/\/.*\n/g, "").replace(/\/\*(\s|.)*\*\//g, "");
}

module.exports = {
  replaceImport,
  removeComment,
  tranCamel2
};
