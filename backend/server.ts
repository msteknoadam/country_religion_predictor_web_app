import * as tf from "@tensorflow/tfjs-node";
import * as path from "path";
import * as express from "express";
import * as socketio from "socket.io";
import * as http from "http";
import * as fs from "fs";
import * as utils from "./utils";
import { createLogger, format, transports } from "winston";
const PORT = 3001;
const logger = createLogger({
	level: "info",
	format: format.combine(
		format.timestamp({
			format: "YYYY-MM-DD HH:mm:ss"
		}),
		format.errors({ stack: true }),
		format.splat(),
		format.json()
	),
	defaultMeta: { service: "AI-ContryReligionPredictor" },
	transports: [
		//
		// - Write to all logs with level `info` and below to `quick-start-combined.log`.
		// - Write all logs error (and below) to `quick-start-error.log`.
		//
		new transports.File({
			filename: "logs/ai-countryreligionpredictor-error.log",
			level: "error"
		}),
		new transports.File({ filename: "logs/ai-countryreligionpredictor-combined.log" })
	]
});

const initializeServer = async () => {
	const app = express();
	const server = http.createServer(app);
	const io = socketio(server);
	let onlineSessions: string[] = [];

	setInterval(() => {
		logger.info(`Stats: Current online count: ${onlineSessions.length}`);
		io.emit("onlineCount", onlineSessions.length);
	}, 60e3);

	app.get("*.ts", (req, res) => {
		utils.sendOpenSourcePage(req, res);
	});

	app.get("/node_modules*", (req, res) => {
		utils.sendOpenSourcePage(req, res);
	});

	app.get("*", (req, res) => {
		const filePath = path.join(__dirname, "..", "client", req.path);
		fs.exists(filePath, exists => {
			if (exists) res.sendFile(filePath);
			else utils.error404(req, res);
		});
	});

	server.listen(PORT, () => {
		console.log(`Listening on *:${PORT}`);
	});

	let model: tf.GraphModel;

	const loadModel = async () => {
		tf.loadGraphModel("https://ai.tekgo.pro/saved_web_model/model.json")
			.then(downloadedModel => {
				model = downloadedModel;
			})
			.catch(e => {
				console.error(e);
			});
	};

	/**
	 * What a neat thing once again, I have to give location of the model as URL form, I can't
	 * directly load it as file from my current directory so I need to wait 5 seconds and then
	 * hope that server got up & running and can serve the model file so I can load it. At least
	 * I made it kind of fail-safe because when a prediction is asked, it firsts check if the model
	 * is loaded and if it's not, then it tries to load the model while asking the user to wait
	 * for a few minutes and then try again later.
	 */

	utils.sleep(5000);

	loadModel();

	io.on("connection", socket => {
		if (!onlineSessions.includes(socket.id)) onlineSessions.push(socket.id);

		socket.emit("initialize", `Hello #${socket.id}`);
		socket.emit("onlineCount", onlineSessions.length);

		socket.on("askPrediction", incomingData => {
			if (typeof model === "undefined") {
				loadModel();
				socket.emit(
					"clientError",
					"Sorry but currently the server is not ready to predict at the moment. Please try again in a few minutes."
				);
			}
			console.log(incomingData);
			if (typeof incomingData !== "object" || incomingData.length !== 8) {
				socket.emit("clientError", "Error! Your input is not in a correct type. Please try again.");
				return;
			}
			const testData: Array<any> = incomingData;
			if (testData.filter(val => typeof val === "number").length !== 8) {
				socket.emit("clientError", "Error! Your input is not in a correct type. Please try again.");
				return;
			}
			const dataArray: Array<number> = testData;
			// @ts-ignore
			const prediction: tf.Tensor = model.predict(tf.tensor([dataArray]));
			/**
			 * Since tfjs-node is a bit problematic (for example, the reason I used ts-ignore
			 * in the prediction declaration is because the defined typed for model.predict output
			 * is Tensor<Rank> and that limits my usage because I can't access Tensor functions
			 * since I'm using TypeScript.), I need to write my own way to find the index of maximum
			 * value in prediction list so I can get the prediction from religionDict array.
			 */
			let maxValueIndex = 0;
			const predictionArray = prediction.dataSync();
			predictionArray.forEach((value: number, index: number) => {
				if (value > predictionArray[maxValueIndex]) {
					maxValueIndex = index;
				}
			});
			socket.emit("predictionResult", maxValueIndex);
			return;
		});

		socket.on("disconnect", () => {
			onlineSessions = onlineSessions.filter(val => val !== socket.id);
		});
	});
};

console.log("Starting to initialize server.");
initializeServer();
