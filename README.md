[![Npm Package](https://img.shields.io/npm/v/ui-component-loader.svg?style=flat-square)](https://www.npmjs.com/package/ui-component-loader)
[![Build Status](https://img.shields.io/travis/gwuhaolin/ui-component-loader.svg?style=flat-square)](https://travis-ci.org/gwuhaolin/ui-component-loader)
[![Npm Downloads](http://img.shields.io/npm/dm/ui-component-loader.svg?style=flat-square)](https://www.npmjs.com/package/ui-component-loader)

# ui-component-loader
Modular UI component loader for webpack, compatible with [antd](https://github.com/ant-design/ant-design), [antd-mobile](https://github.com/ant-design/ant-design-mobile), and so on.

## Example

| description | options | source | output |
| --- | --- | --- | --- |
| replace one | `lib: 'antd'` | `import {Button} from 'antd'` | `import Button from 'antd/lib/Button'` |
| replace many | `lib: 'antd'` | `import {Button,Icon} from 'antd'` | `import Button from 'antd/lib/Button' import Icon from 'antd/lib/Icon'` |
| set libDir | `lib: 'antd', libDir: 'es'` | `import {Button} from 'antd'` | `import Button from 'antd/es/Button'` |
| use style | `lib: 'antd', style: 'index.css'` | `import {Button} from 'antd'` | `import Button from 'antd/lib/Button' import 'antd/lib/Button/index.css'` |
| translate camel | `lib: 'antd',camel2: '-'` | `import {MyComponent} from 'antd'` | `import MyComponent from 'antd/lib/my-component'` |

  
## Usage
Install:
```bash
npm install ui-component-loader --D
```

Edit `webpack.config.js`:
```js
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ui-component-loader?lib=antd&style=css', 'awesome-typescript-loader']
      },
      // ...  
    ]
  },
  // ...  
};
```

## Options
- lib: library want to replace,value is name in npm.
- libDir: library directory path which store will use code, default it `lib`  
- style: should append style file to a component? value is relative path to style file.
- camel2: should translate MyComponent to my-component, value is the join string. 

## Diff with [babel-plugin-import](https://github.com/ant-design/babel-plugin-import)
1. babel-plugin-import is a babel plugin, which means must be used in project with babel.
But in some project, like project use TypeScript, ui-component-loader is useful.
ui-component-loader can be used in any project with webpack.
2. ui-component-loader has better performance as it's implement by regular expression replace string, but babel-plugin-import base on AST.
 