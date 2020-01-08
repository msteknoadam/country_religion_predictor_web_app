import * as tf from "@tensorflow/tfjs";
import { loadGraphModel } from "@tensorflow/tfjs-converter";
import * as path from "path";
import * as express from "express";
import * as socketio from "socket.io";
import * as http from "http";
import * as path from "path";
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

io.on("connection", socket => {
	if (!onlineSessions.includes(socket.request.session.id)) onlineSessions.push(socket.request.session.id);

	socket.emit("initialize", `Hello #${socket.request.session.id}`);
	socket.emit("onlineCount", onlineSessions.length);

	socket.on("disconnect", () => {
		onlineSessions = onlineSessions.filter(val => val !== socket.request.session.id);
	});
});

tf.loadLayersModel("https://ai.tekgo.pro/saved_web_model/model.json").then(model => {
	console.log(model.summary());
});

server.listen(PORT, () => {
	console.log(`Listening on *:${PORT}`);
});
