const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin');
const { LicenseWebpackPlugin } = require('license-webpack-plugin');
const { merge } = require('webpack-merge')

const paths = require('./paths')
const common = require('./webpack.common')
const fs = require('fs');
const path = require('path');

module.exports = merge(common, {
  mode: 'production',
  devtool: false,
  output: {
    path: paths.build,
    filename: 'escapp.js',
    assetModuleFilename: "images/[name][ext]",
    publicPath: '',
  },
  module: {
    rules: [
      {
        test: /\.(sass|scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              sourceMap: false,
              modules: false,
            },
          },
          'postcss-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.images,
          to: 'images',
          noErrorOnMissing: true,
        }
      ],
    }),
    new MiniCssExtractPlugin({
      filename: 'escapp.css',
      chunkFilename: '[id].css',
    }),
    new LicenseWebpackPlugin({
      perChunkOutput: false,
      outputFilename: 'escapp.js.LICENSE',
      addBanner: false,

      licenseTypeOverrides: {
        'socket.io-client': 'MIT',
        'engine.io-client': 'MIT',
        '@socket.io/component-emitter': 'MIT',
        'engine.io-parser': 'MIT',
      },

      licenseTextOverrides: {
        'socket.io-client': fs.readFileSync(
          path.resolve(__dirname, '../node_modules/socket.io-client/LICENSE'),
          'utf8'
        ),
        'engine.io-client': fs.readFileSync(
          path.resolve(__dirname, '../node_modules/engine.io-client/LICENSE'),
          'utf8'
        ),
        '@socket.io/component-emitter': fs.readFileSync(
          path.resolve(__dirname, '../node_modules/@socket.io/component-emitter/LICENSE'),
          'utf8'
        ),
        'engine.io-parser': fs.readFileSync(
          path.resolve(__dirname, '../node_modules/engine.io-parser/LICENSE'),
          'utf8'
        ),
      },

      renderLicenses: (modules) => {
        const license = fs.readFileSync(
          path.resolve(__dirname, '../LICENSE'),
          'utf8'
        );

        const manualLicenses = fs.readFileSync(
          path.resolve(__dirname, '../LICENSES_THIRD_PARTY'),
          'utf8'
        );

        const additionalLicenses = modules.map((module) => {
          const packageName = module.packageJson.name;
          const packageVersion = [
            'socket.io-client',
            'engine.io-client',
            '@socket.io/component-emitter',
            'engine.io-parser',
          ].includes(packageName)
            ? JSON.parse(
                fs.readFileSync(
                  path.resolve(__dirname, '../node_modules', packageName, 'package.json'),
                  'utf8'
                )
              ).version
            : module.packageJson.version;
          return [
            `${packageName} v${packageVersion}`,
            `License: ${module.licenseId}`,
            module.licenseText || '',
          ].join('\n');
        }).join('\n\n-------------------------------------------------------------------------------------------------\n\n');

        return [
          license,
          '\n\n-------------------------------------------------------------------------------------------------\n',
          manualLicenses,
          '\n\n-------------------------------------------------------------------------------------------------\n',
          'Additional Third-Party Dependencies',
          '\n',
          additionalLicenses,
        ].join('\n');
      },
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [new CssMinimizerPlugin(), 
    new TerserPlugin({
      terserOptions: {
        format: { comments: /@license|@preserve|@cc_on|^!/, },
      },
      extractComments: false,
    }),
    ],
    runtimeChunk: false,
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000,
  },
})
