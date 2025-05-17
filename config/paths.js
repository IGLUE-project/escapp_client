const path = require('path')

module.exports = {
  // Source files
  src: path.resolve(__dirname, '../src'),
  index: path.resolve(__dirname, '../src/index.html'),
  jQuery: path.resolve(__dirname, '../src/js/jquery-3.7.1.min.js'),

  // Production build files
  build: path.resolve(__dirname, '../dist'),

  //Static files that get copied to build folder
  public: path.resolve(__dirname, '../public'),
  images: path.resolve(__dirname, '../public/images'),
  license: path.resolve(__dirname, '../LICENSE'),
}