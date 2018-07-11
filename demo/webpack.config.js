const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  output: {
    filename: './dist/bundle.js',
  },
  resolve: {
    extensions: ['.js', '.tsx', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          'ts-loader',
          {
            loader: 'ui-component-loader',
            options: {
              'lib': 'antd',
              'camel2': '-',
              'libDir': 'es',
              'style': 'style/index.css',
            }
          },
        ],
        // 你导入了antd所在的源码的位置
        include: path.resolve('src'),
      },
      {test: /\.css?$/, use: ['style-loader', 'css-loader']}
    ]
  },
  devtool: 'source-map'
};