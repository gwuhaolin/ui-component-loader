'use strict';
const assert = require('assert');
const {replaceImport, removeComment, tranCamel2} = require('../lib/util');

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
      output: `import Button from 'antd/lib/Button';`,
      options: {
        lib: 'antd'
      },
    },
    {
      des: 'lib 命中',
      source: `import {Button} from 'antd'`,
      output: `import Button from 'antd/lib/Button';`,
      options: {
        lib: 'antd'
      },
    },
    {
      des: '使用 libDir',
      source: `import {Button} from 'antd'`,
      output: `import Button from 'antd/es/Button';`,
      options: {
        lib: 'antd',
        libDir: 'es',
      },
    },
    {
      des: 'import 语句中间有很多空格',
      source: `import     {  Button} from    "antd"`,
      output: `import Button from 'antd/lib/Button';`,
      options: {
        lib: 'antd'
      },
    },
    {
      des: '导入多个 component',
      source: `import     {  Button,     Icon} from    "antd"`,
      output: `import Button from 'antd/lib/Button';import Icon from 'antd/lib/Icon';`,
      options: {
        lib: 'antd'
      },
    },
    {
      des: '使用 style',
      source: `import {Button} from 'antd';`,
      output: `import Button from 'antd/lib/Button';import 'antd/lib/Button/index.css';`,
      options: {
        lib: 'antd',
        style: 'index.css'
      },
    },
    {
      des: '导入多个 component & 使用 style',
      source: `import {Button,Icon} from 'antd'`,
      output: `import Button from 'antd/lib/Button';import 'antd/lib/Button/index.css';import Icon from 'antd/lib/Icon';import 'antd/lib/Icon/index.css';`,
      options: {
        lib: 'antd',
        style: 'index.css'
      },
    },
    {
      des: '使用 相对路径的 style',
      source: `import {Button} from 'antd';`,
      output: `import Button from 'antd/lib/Button';import 'antd/lib/Button/style/index.css';`,
      options: {
        lib: 'antd',
        style: './style/index.css'
      },
    },
    {
      des: '使用 camel2 转化大小写',
      source: `import {MyComponent} from 'antd'`,
      output: `import MyComponent from 'antd/lib/my-component';`,
      options: {
        lib: 'antd',
        camel2: '-'
      },
    },
    {
      des: '使用 camel2 转化大小写',
      source: `import {Button} from 'antd'`,
      output: `import Button from 'antd/lib/button';`,
      options: {
        lib: 'antd',
        camel2: '-'
      },
    },
    {
      des: '使用 componentDirMap 映射路径',
      source: `import {MyComponent} from 'antd'`,
      output: `import MyComponent from 'antd/lib/YourComponent';`,
      options: {
        lib: 'antd',
        camel2: '-',
        componentDirMap: {
          MyComponent: 'YourComponent'
        }
      },
    },
    {
      des: '不能覆盖其它',
      source: `import * as React from 'react';
import {Component} from 'react';
import {svgQRCode} from '@mtfe/mcashier-components/es/Icon/svgs';`,
      output: `import * as React from 'react';
import {Component} from 'react';
import {svgQRCode} from '@mtfe/mcashier-components/es/Icon/svgs';`,
      options: {
        lib: '@mtfe/mcashier-components',
        libDir: 'es',
      },
    },
    {
      des: '不能覆盖其它2',
      source: `import * as React from 'react';
import {Component} from 'react';
import {svgQRCode} from '@mtfe/mcashier-components/es/Icon/svgs';
import {Form} from '@mtfe/mcashier-components';
import {GoodsTO} from '@server/thrift/dist/GoodsModel_types';`,
      output: `import * as React from 'react';
import {Component} from 'react';
import {svgQRCode} from '@mtfe/mcashier-components/es/Icon/svgs';
import Form from '@mtfe/mcashier-components/es/Form';
import {GoodsTO} from '@server/thrift/dist/GoodsModel_types';`,
      options: {
        lib: '@mtfe/mcashier-components',
        libDir: 'es',
      },
    },

    {
      des: '支持组件换行',
      source: `import {
 DatePicker,
 List,
} from '@mtfe/mcashier-components'`,
      output: `import DatePicker from '@mtfe/mcashier-components/es/DatePicker';import List from '@mtfe/mcashier-components/es/List';`,
      options: {
        lib: '@mtfe/mcashier-components',
        libDir: 'es',
      },
    },
    {
      des: '支持组件换行后注释掉部分组件',
      source: `import {
 toast
 // IDateRangePickerViewProps,
 /* Aa */
} from '@mtfe/sjst-ui'`,
      output: `import toast from '@mtfe/sjst-ui/es/Toast';import '@mtfe/sjst-ui/es/Toast/index.css';`,
      options: {
        lib: '@mtfe/sjst-ui',
        libDir: 'es',
        style: 'index.css',
        componentDirMap: {
          toast: 'Toast',
        },
      },
    },
  ];

  testData.forEach(({des, source, output, options = {}}) => {
    it(des, function () {
      let realOutput = replaceImport(source, Object.assign(options, {
        existCheck: () => true,
      }));
      assert.equal(realOutput, output, `
        source=${source}
        options=${JSON.stringify(options)}
        `);
    });
  });
});

describe('util.js#removeComment', () => {
  it('removeComment', () => {
    const ret = removeComment(`import {
  //a
  // a
  /*a*/
  /*a
  * a
  * */
  a
} from 'a'
`);
    assert.equal(ret, `import {
      
  a
} from 'a'
`);
  });
});

describe('util.js#tranCamel2', () => {
  it('joinString is null', () => {
    assert.equal(tranCamel2('InputItem'), 'InputItem');
  });
  it('joinString is -', () => {
    assert.equal(tranCamel2('InputItem', '-'), 'input-item');
  });
  it('joinString is _', () => {
    assert.equal(tranCamel2('InputItem', '_'), 'input_item');
  });
  it('joinString is blank str', () => {
    assert.equal(tranCamel2('InputItem', ''), 'inputitem');
  });
  it('1', () => {
    assert.equal(tranCamel2('Input', '_'), 'input');
  });
  it('3', () => {
    assert.equal(tranCamel2('InputItemIcon', '_'), 'input_item_icon');
  });
  it('4', () => {
    assert.equal(tranCamel2('InputItemIconButton', '_'), 'input_item_icon_button');
  });
});