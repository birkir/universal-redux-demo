const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const OfflinePlugin = require('offline-plugin');

module.exports = function make(options) {

  const isClient = (options.target === 'web');
  const isHot = isClient && (options.hot === true);
  const routes = [].concat(options.routes ? options.routes : []);

  // Init entry point with babel (always)
  let entry = ['babel-polyfill'];
  let output = {};

  // Init plugins with provide, define and no errors
  const plugins = [
    new webpack.ProvidePlugin({
      React: 'react',
    }),
    new webpack.DefinePlugin({
      __CLIENT__: (options.target === 'web'),
    }),
    new webpack.NoErrorsPlugin(),
  ];

  // Styles loader
  const loader = {
    css: 'css-loader?modules&importLoaders=1'
      + '&localIdentName=[name]_[local]_[hash:base64:5]!postcss-loader',

    babel: 'babel-loader?presets[]=react&presets[]=es2015'
      + `&presets[]=stage-0${isHot ? '&presets[]=react-hmre' : ''}`,
  };

  if (isClient) {
    plugins.push(new OfflinePlugin({
      caches: {
        main: [
          '/',
          ':rest:',
        ],
        additional: routes,
      },
      externals: ['/', ...routes],
      safeToUseOptionalCaches: true,
      updateStrategy: 'all',
      version: 'v1',
      ServiceWorker: {
        output: 'sw.js',
      },
      AppCache: {
        directory: 'appcache/',
      },
    }));
  }

  // Hot Loading
  if (isHot) {

    // Add hot middleware
    entry.push('webpack-hot-middleware/client');

    // Add HMRE plugin
    plugins.push(new webpack.HotModuleReplacementPlugin());
  }

  if (!isClient) {

    // Add source maps and extract styles
    plugins.push(
      new ExtractTextPlugin('styles.css')
    );
  }

  // Set entry point
  if (options.entry) {

    // Set entry
    entry.push(options.entry);

    // Set output
    output = {
      path: path.join(__dirname, '..', 'build'),
      filename: path.basename(options.entry),
      publicPath: '/',
      libraryTarget: (isClient ? 'var' : 'commonjs2'),
    };
  } else {
    entry = {};
  }

  const config = {
    context: path.join(__dirname, '../'),
    debug: options.debug || true,
    devtool: options.devtool || (isClient ? 'cheap-module-eval-source-map' : 'eval-source-map'),
    target: options.target || 'web',

    entry,
    plugins,
    output,

    resolve: {
      modulesDirectories: ['./node_modules', './src/components', './src'],
      extensions: ['', '.js', '.json', '.css', '.less'],
    },

    module: {
      preLoaders: [{
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/,
      }],
      loaders: [{
        test: /\.js/,
        loader: loader.babel,
        exclude: /node_modules/,
      }, {
        test: /\.css$/,
        loader: (isClient ? `style-loader!${loader.css}` : ExtractTextPlugin.extract('style-loader', loader.css)), // eslint-disable-line
        exclude: /node_modules/,
      }, {
        test: /\.less$/,
        loader: (isClient ? `style-loader!${loader.css}!less-loader` : ExtractTextPlugin.extract('style-loader', `${loader.css}!less-loader`)), // eslint-disable-line
        exclude: /node_modules/,
      }, {
        test: /\.(woff2?|svg|jpe?g|png|gif|ico)$/,
        loader: 'url?limit=10000',
      }, {
        test: /\.json$/,
        loader: 'json-loader',
      }],
    },

    postcss: () => [autoprefixer],
  };

  if (options.eslint === false) {
    config.module.preLoaders = config.module.preLoaders.filter(n => (n.loader !== 'eslint-loader'));
  }

  if (!isClient) {
    // Don't import node binary packages
    config.externals = /^[a-z\-0-9]+$/;
  }

  return config;
};
