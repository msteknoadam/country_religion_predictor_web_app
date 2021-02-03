import config from "./webpack.frontend.config.prod";

Object.assign(config, {
	mode: "development",
});

export default config;
