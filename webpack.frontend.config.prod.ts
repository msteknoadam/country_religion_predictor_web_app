import path from "path";
import * as webpack from "webpack";

const config: webpack.Configuration = {
	entry: {
		"./client/main": path.resolve(__dirname, "client", "main.ts"),
	},
	mode: "production",
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: "ts-loader",
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
	output: {
		filename: "[name].js",
		path: path.resolve(__dirname, "client", "build"),
	},
};

export default config;
