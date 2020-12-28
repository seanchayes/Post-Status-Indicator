const path = require('path');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const webpackConfig = {
  mode: 'development',
  context: path.resolve(__dirname, 'psi-dashboard/src'),
  resolve: {
    alias: {
      "@Contexts": path.resolve(__dirname, "psi-dashboard/src/contexts/"),
      "@Components": path.resolve(__dirname,"psi-dashboard/src/components/"),
      "@Utils": path.resolve(__dirname, "psi-dashboard/src/utils/")
    }
  },
  entry: {
    "post-status-indicator": path.join(__dirname, 'psi-dashboard/src', 'index.js')
  },
  output: {
    filename: 'js/[name].js',
    path: path.resolve(__dirname, 'psi-dashboard/dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /.(css|scss)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'wp-content/plugins/post-status-indicator/psi-dashboard/dist/img/[name].[ext]'
          }
        }
      }
    ]
  },
  plugins: [
    new BrowserSyncPlugin({
      proxy: {
        target: 'https://localhost'
      },
      files: ['**/*.php'],
      cors: true,
      reloadDelay: 0,
      open: false
    }),
    new MiniCssExtractPlugin({
      disable: false,
      filename: 'css/style.[name].css',
      allChunks: true
    })
  ]
};

if (process.env.NODE_ENV === 'production') {
  webpackConfig.mode = 'production';
}

module.exports = webpackConfig;
