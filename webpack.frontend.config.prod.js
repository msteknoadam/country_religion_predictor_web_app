const path = require("path");

module.exports = {
	entry: {
		"./client/main": path.resolve(__dirname, "client", "main.ts")
	},
	mode: "production",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/
			}
		]
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"]
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname)
	}
};
