var path = require('path');

module.exports = {
  entry: __dirname + '/index.js',
	output: {
    path: __dirname + '/dist',
		filename: "index.js",
		library: "RestStore",
		libraryTarget: "umd"
	},
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel",
        query: {
          presets: ['es2015', 'stage-0']
        }
      }
    ]
  },
  resolve: {
    extensions: ["", ".js"]
  },
  node: {
    global: false
  }
}
