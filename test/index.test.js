'use strict';
const assert = require('assert');
const { replaceImport } = require('../lib/util');

describe('util.js#replaceImport', function () {

  const testData = [
    {
      des: '没有 lib 参数',
      source: `import {Button} from 'antd'`,
      output: `import {Button} from 'antd'`,
      options: undefined,
    },
    {
      des: 'lib 不符合',
      source: `import {Component} from 'react'`,
      output: `import {Component} from 'react'`,
      options: {
        lib: 'antd'
      },
    },
    {
      des: 'lib 命中,保留后面的;',
      source: `import {Button} from 'antd';`,
      output: `import Button from 'antd/lib/Button'\n;`,
      options: {
        lib: 'antd'
      },
    },
    {
      des: 'lib 命中',
      source: `import {Button} from 'antd'`,
      output: `import Button from 'antd/lib/Button'\n`,
      options: {
        lib: 'antd'
      },
    },
    {
      des: '使用 libDir',
      source: `import {Button} from 'antd'`,
      output: `import Button from 'antd/es/Button'\n`,
      options: {
        lib: 'antd',
        libDir: 'es',
      },
    },
    {
      des: 'import 语句中间有很多空格',
      source: `import     {  Button} from    "antd"`,
      output: `import Button from 'antd/lib/Button'\n`,
      options: {
        lib: 'antd'
      },
    },
    {
      des: '导入多个 component',
      source: `import     {  Button,     Icon} from    "antd"`,
      output: `import Button from 'antd/lib/Button'\nimport Icon from 'antd/lib/Icon'\n`,
      options: {
        lib: 'antd'
      },
    },
    {
      des: '使用 style',
      source: `import {Button} from 'antd';`,
      output: `import Button from 'antd/lib/Button'\nimport 'antd/lib/Button/index.css'\n;`,
      options: {
        lib: 'antd',
        style: 'index.css'
      },
    },
    {
      des: '导入多个 component & 使用 style',
      source: `import {Button,Icon} from 'antd';`,
      output: `import Button from 'antd/lib/Button'
import 'antd/lib/Button/index.css'
import Icon from 'antd/lib/Icon'
import 'antd/lib/Icon/index.css'
;`,
      options: {
        lib: 'antd',
        style: 'index.css'
      },
    },
    {
      des: '使用 相对路径的 style',
      source: `import {Button} from 'antd';`,
      output: `import Button from 'antd/lib/Button'\nimport 'antd/lib/Button/style/index.css'\n;`,
      options: {
        lib: 'antd',
        style: './style/index.css'
      },
    },
    {
      des: '使用 camel2 转化大小写',
      source: `import {MyComponent} from 'antd'`,
      output: `import MyComponent from 'antd/lib/my-component'\n`,
      options: {
        lib: 'antd',
        camel2: '-'
      },
    },
  ];

  testData.forEach(({ des, source, output, options }) => {
    it(des, function () {
      let realOutput = replaceImport(source, options);
      assert.equal(realOutput, output, `
        source=${source}
        options=${JSON.stringify(options)}
        `);
    });
  });
});
