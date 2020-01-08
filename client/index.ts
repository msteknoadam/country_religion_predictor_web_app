declare global {
	interface Window {
		socket: SocketIOClient.Socket;
		io: SocketIOClientStatic;
		utils: any;
	}
}

import * as io from "socket.io-client";
import * as utils from "./utils";

const socket = io("//" + window.location.host, {
	query: "session_id=" + utils.getCookie("USERDATA")
});
window.socket = socket;
window.io = io;
window.utils = utils;

socket.on("initialize", (data: string) => {
	const uid = data.slice(7);
	(<HTMLDivElement>document.body.querySelector(".initializeMessage")).innerHTML = `${data}<br />`;
});

socket.on("clientError", (error: string) => {
	utils.error(error);
});

socket.on("onlineCount", (onlineCount: number) => {
	utils.setOnlineCount(onlineCount);
});
