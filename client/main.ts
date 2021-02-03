import { io } from "socket.io-client";
import { religionDict } from "./constants";
import * as utils from "./utils";

const socket = io("//" + window.location.host, {
	query: "session_id=" + utils.getCookie("USERDATA"),
});

socket.on("initialize", (data: string) => {
	(<HTMLDivElement>document.body.querySelector(".initializeMessage")).innerHTML = `${data}<br />`;
	(<HTMLTableElement>document.body.querySelector(".askPredictionBox table.disabled")).setAttribute("class", "");
	const sendButton = <HTMLButtonElement>document.body.querySelector(".askPredictionBox button.askPrediction");
	sendButton.addEventListener("click", (event) => {
		event.preventDefault();
		const inputValues: Array<number> = [];
		const inputs = document.body.querySelectorAll(".askPredictionBox input");
		inputs.forEach((el) => {
			const element = el as HTMLInputElement;
			if (element.value === "") return;
			const inputValue = Number(element.value);
			if (isNaN(inputValue)) {
				return;
			}
			inputValues.push(inputValue);
		});
		if (inputValues.length !== 8) {
			return utils.error("Error! Your input is not in a correct type. Please try again.");
		}
		socket.emit("askPrediction", inputValues);
	});
});

socket.on("clientError", (error: string) => {
	utils.error(error);
});

socket.on("onlineCount", (onlineCount: number) => {
	utils.setOnlineCount(onlineCount);
});

socket.on("predictionResult", (result: number) => {
	console.log(`Got prediction result from the server: ${result}`);
	(<HTMLSpanElement>(
		document.body.querySelector(".predictionResultBox .resultText")
	)).innerHTML = `Model predicts that country's religion is: ${religionDict[result][0]}
	<br />
	<br />
	Based on this, that country might be one of these: <br />${religionDict[result].splice(1).join("<br />")}`;
});
