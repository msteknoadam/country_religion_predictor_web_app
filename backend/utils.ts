import { Request, Response } from "express";
import { readFile } from "fs";
import { join } from "path";

type colorTypes = "red" | "yellow" | "green" | "black";

const colors: { [c in colorTypes]: string } = {
	red: "\x1B[31m",
	yellow: "\x1B[33m",
	green: "\x1B[32m",
	black: "\x1B[39m"
};

export const error404 = (req: Request, res: Response) => {
	readFile(join(__dirname, "..", "client", "404.html"), (err, data) => {
		if (err) res.sendStatus(500);
		res.status(404).send(data.toString().replace("{{ req.path }}", req.path));
	});
};

export const error401 = (req: Request, res: Response) => {
	readFile(join(__dirname, "..", "client", "401.html"), (err, data) => {
		if (err) res.sendStatus(500);
		res.status(401).send(data.toString());
	});
};

export const sendOpenSourcePage = (req: Request, res: Response) => {
	readFile(join(__dirname, "..", "client", "openSource.html"), (err, data) => {
		if (err) res.sendStatus(500);
		res.send(data.toString());
	});
};

export const coloredConsoleLog = (text: string, color: colorTypes = "black") => {
	console.log(`${colors[color]}${text}${colors.black}`);
};

/**
 * @param {duration} "How long to sleep in milliseconds."
 */
export const sleep = (duration: number) => {
	return new Promise(resolve => setTimeout(resolve, duration));
};
