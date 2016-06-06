const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const OfflinePlugin = require('offline-plugin');
const NODE_ENV = process.env.NODE_ENV;

/**
 * # Configuration
 *
 * ### `target`
 * Specify which platform to target, currently accepts `"web"` (client), and `"node"` (server).
 *
 * ### `hot`
 * Boolean value to enable hot reloading on the client. Only works in development mode.
 *
 * ### `offline`
 * Boolean value to enable offline support. You should specify which routes to cache
 * within the `offlineCache` array option.
 *
 * ### `offlineCache`
 * Array of routes to cache. Defaults to `['/']` (the index page).
 *
 * **TODO:** Read routes.js and allow attribute to enable offline availability.
 *
 * ### `entry`
 * Path to an entry point for packaging. Will output the same name into `./build`.
 *
 * **TODO:** Allow multiple entry points.
 *
 * ### `debug`
 * Enable or disable debug mode. The production will always overwrite with `false`.
 *
 * ### `devtool`
 * Set the devtool sourcemapping. Defaults to `cheap-module-eval-source-map` for client
 * and `eval-source-map` for server.
 *
 * ### `eslint`
 * Enable or disable eslinting of the javascript on runtime. Only in debug mode.
**/
module.exports = function make(options) {

  const isRelease = (NODE_ENV === 'production');
  const isClient = (options.target === 'web');
  const isHot = isClient && (options.hot === true) && !isRelease;

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
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
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

  if (isClient && options.offline) {
    const routes = [].concat(options.offlineCache ? options.offlineCache : []);

    plugins.push(new OfflinePlugin({
      caches: {
        main: [
          '/',
          '/styles.css',
          ':rest:',
        ],
        additional: routes,
      },
      externals: ['/', ...routes],
      safeToUseOptionalCaches: true,
      updateStrategy: 'all',
      version: '[hash]',
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

    const additionalEntries = entry;
    entry = {};

    // Set entry
    Object.keys(options.entry).forEach(key => {
      entry[key] = [...additionalEntries, options.entry[key]];
    });

    // Set output
    output = {
      path: path.join(__dirname, '..', 'build'),
      filename: '[name].js',
      chunkFilename: 'chunk.[id].js',
      publicPath: '/',
      libraryTarget: (isClient ? 'var' : 'commonjs2'),
    };
  } else {
    entry = {};
  }

  if (isRelease) {
    options.devtool = 'cheap-module-source-map'; // eslint-disable-line
    options.debug = false; // eslint-disable-line
  }

  const config = {
    context: path.join(__dirname, '../'),
    debug: (options.debug !== undefined) ? options.debug : !isRelease,
    devtool: (options.devtool !== undefined) ? options.devtool : (isClient ? 'eval' : 'eval-source-map'), // eslint-disable-line
    target: options.target || 'web',

    entry,
    plugins,
    output,

    resolve: {
      modulesDirectories: ['./node_modules', './src'],
      extensions: ['', '.js', '.json', '.css', '.less'],
    },

    module: {
      preLoaders: [],
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

  if ((process.env.TRAVIS || !isRelease) && options.eslint) {
    config.module.preLoaders.push({
      test: /\.js$/,
      loader: 'eslint-loader',
      exclude: /node_modules/,
    });
  }

  if (!isClient) {
    // Don't import node binary packages
    config.externals = /^[a-z\-0-9]+$/;
  }

  if (options.lazy && isClient) {
    const jsLoader = config.module.loaders.find(item => '.js'.match(item.test));
    jsLoader.exclude = /node_modules|routes\/([^\/]+\/?[^\/]+)\.lazy.js/;
    config.module.loaders.push({
      test: /routes\/([^\/]+\/?[^\/]+)\.lazy.js/,
      loader: `bundle-loader?lazy!${loader.babel}`,
      exclude: /node_modules/,
    });
  }

  return config;
};
