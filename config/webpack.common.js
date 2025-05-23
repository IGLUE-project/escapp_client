const paths = require('./paths')
const webpack = require('webpack')

module.exports = {
  // Where webpack looks to start building the bundle
  entry: [paths.src + '/index.js'],

  // Where webpack outputs the assets and bundles
  output: {
    path: paths.build,
    filename: '[name].bundle.js',
    publicPath: '/',
  },

  // Determine how modules within the project are treated
  module: {
    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      { 
        test: /\.js$/, 
        use: ['babel-loader'],
      },
      // Images: Copy image files to build folder
      { 
        test: /\.(?:ico|gif|png|jpg|jpeg)$/i, 
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]',
        },
      },

      // Fonts and SVGs: Inline files
      { 
        test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, 
        type: 'asset/inline',
      },
    ],
  },

  resolve: {
    modules: [paths.src, 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': paths.src,
      jQuery: paths.jQuery,
    },
  },

  plugins: [
    new webpack.ProvidePlugin({
      $: 'jQuery',
      jQuery: 'jQuery',
    }),
  ],
}