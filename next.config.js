const webpack = require("webpack")
require("dotenv").config()

module.exports = {
	webpack: (config, { dev }) => {
		config.module.rules.push(
			{
				test: /\.(css|scss)/,
				loader: "emit-file-loader",
				options: {
					name: "dist/[path][name].[ext]"
				}
			},
			{
				test: /\.css$/,
				loader: "babel-loader!raw-loader"
			},
			{
				test: /\.scss$/,
				loader: "babel-loader!raw-loader!sass-loader"
			}
		)
		config.plugins.concat([
			new webpack.DefinePlugin({
				"process.env.API_URL": JSON.stringify(process.env.API_URL)
			})
		])
		return config
	}
}
