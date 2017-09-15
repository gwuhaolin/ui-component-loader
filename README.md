# ui-component-loader
Modular UI component loader for webpack, compatible with [antd](https://github.com/ant-design/ant-design), [antd-mobile](https://github.com/ant-design/ant-design-mobile), and so on.

## Example
- `{ "libraryName": "antd" }`
  ```js
  // source
  import { Button } from 'antd';

  // out
  var _button = require('antd/lib/button');
  ```

- `{ "libraryName": "antd", style: "css" }`
  ```js
  // source
  import { Button } from 'antd';

  // out
  var _button = require('antd/lib/button');
  require('antd/lib/button/style/index.css');
  ```
  
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
        use: ['ui-component-loader?libraryName=antd&style=css', 'awesome-typescript-loader']
      },
      // ...  
    ]
  },
  // ...  
};
```

## Options
- libraryName
- libraryDirectory
- camel2DashComponentName
- style

## Diff with [babel-plugin-import](https://github.com/ant-design/babel-plugin-import)
