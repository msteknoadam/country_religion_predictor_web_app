declare global {
	interface Window {
		socket: SocketIOClient.Socket;
		io: SocketIOClientStatic;
		utils: any;
	}
}

import * as io from "socket.io-client";
import * as utils from "./utils";

const religionDict = [
	[
		"Catholic",
		"Andorra",
		"Argentina",
		"Argentine",
		"Austria",
		"Belgium",
		"Bolivia",
		"Brazil",
		"Cape-Verde-Islands",
		"Chile",
		"Colombia",
		"Costa-Rica",
		"Dominican-Republic",
		"Ecuador",
		"El-Salvador",
		"France",
		"French-Guiana",
		"French-Polynesia",
		"Guatemala",
		"Haiti",
		"Honduras",
		"Ireland",
		"Italy",
		"Liechtenstein",
		"Luxembourg",
		"Malta",
		"Mexico",
		"Monaco",
		"Nicaragua",
		"Panama",
		"Parguay",
		"Peru",
		"Philippines",
		"Portugal",
		"Puerto-Rico",
		"San-Marino",
		"Sao-Tome",
		"Spain",
		"Uruguay",
		"Vatican-City",
		"Venezuela"
	],
	[
		"Other Christian",
		"American-Samoa",
		"Anguilla",
		"Antigua-Barbuda",
		"Australia",
		"Bahamas",
		"Barbados",
		"Belize",
		"Bermuda",
		"British-Virgin-Isles",
		"Cameroon",
		"Canada",
		"Cayman-Islands",
		"Cook-Islands",
		"Cyprus",
		"Denmark",
		"Dominica",
		"Ethiopia",
		"Faeroes",
		"Falklands-Malvinas",
		"Fiji",
		"Finland",
		"Germany-FRG",
		"Gibraltar",
		"Greece",
		"Greenland",
		"Grenada",
		"Guam",
		"Iceland",
		"Jamaica",
		"Kiribati",
		"Malagasy",
		"Marianas",
		"Micronesia",
		"Montserrat",
		"Nauru",
		"Netherlands",
		"Netherlands-Antilles",
		"New-Zealand",
		"Niue",
		"Norway",
		"Seychelles",
		"Soloman-Islands",
		"South-Africa",
		"St-Helena",
		"St-Kitts-Nevis",
		"St-Lucia",
		"St-Vincent",
		"Surinam",
		"Swaziland",
		"Sweden",
		"Switzerland",
		"Tonga",
		"Trinidad-Tobago",
		"Turks-Cocos-Islands",
		"Tuvalu",
		"UK",
		"US-Virgin-Isles",
		"USA",
		"Vanuatu",
		"Western-Samoa"
	],
	[
		"Muslim",
		"Afghanistan",
		"Algeria",
		"Bahrain",
		"Bangladesh",
		"Brunei",
		"Comorro-Islands",
		"Djibouti",
		"Egypt",
		"Guinea",
		"Indonesia",
		"Iran",
		"Iraq",
		"Jordan",
		"Kuwait",
		"Lebanon",
		"Libya",
		"Malaysia",
		"Maldive-Islands",
		"Mali",
		"Mauritania",
		"Morocco",
		"Niger",
		"Nigeria",
		"North-Yemen",
		"Oman",
		"Pakistan",
		"Qatar",
		"Saudi-Arabia",
		"Senegal",
		"Somalia",
		"South-Yemen",
		"Sudan",
		"Syria",
		"Tunisia",
		"Turkey",
		"UAE"
	],
	["Buddhist", "Bhutan", "Burma", "Hong-Kong", "Kampuchea", "Singapore", "Sri-Lanka", "Taiwan", "Thailand"],
	["Hindu", "Guyana", "India", "Mauritius", "Nepal"],
	[
		"Ethnic",
		"Angola",
		"Benin",
		"Botswana",
		"Burkina",
		"Burundi",
		"Central-African-Republic",
		"Chad",
		"Congo",
		"Equatorial-Guinea",
		"Gabon",
		"Gambia",
		"Ghana",
		"Guinea-Bissau",
		"Ivory-Coast",
		"Kenya",
		"Lesotho",
		"Liberia",
		"Malawi",
		"Mozambique",
		"Papua-New-Guinea",
		"Rwanda",
		"Sierra-Leone",
		"Tanzania",
		"Uganda",
		"Zaire",
		"Zambia",
		"Zimbabwe"
	],
	[
		"Marxist",
		"Albania",
		"Bulgaria",
		"China",
		"Cuba",
		"Czechoslovakia",
		"Germany-DDR",
		"Hungary",
		"Laos",
		"Mongolia",
		"North-Korea",
		"Poland",
		"Romania",
		"USSR",
		"Vietnam",
		"Yugoslavia"
	],
	["Others", "Israel", "Japan", "South-Korea", "Togo"]
];

const socket = io("//" + window.location.host, {
	query: "session_id=" + utils.getCookie("USERDATA")
});
window.socket = socket;
window.io = io;
window.utils = utils;

socket.on("initialize", (data: string) => {
	const uid = data.slice(7);
	(<HTMLDivElement>document.body.querySelector(".initializeMessage")).innerHTML = `${data}<br />`;
	(<HTMLTableElement>document.body.querySelector(".askPredictionBox table.disabled")).setAttribute("class", "");
	const sendButton = <HTMLButtonElement>document.body.querySelector(".askPredictionBox button.askPrediction");
	sendButton.addEventListener("click", event => {
		event.preventDefault();
		const inputValues: Array<number> = [];
		const inputs = document.body.querySelectorAll(".askPredictionBox input");
		inputs.forEach((el: HTMLInputElement) => {
			if (el.value === "") return;
			const inputValue = Number(el.value);
			if (isNaN(inputValue)) {
				return;
			}
			inputValues.push(inputValue);
		});
		if (inputValues.length !== 8) {
			utils.error(`Error! Your input is not in a correct type. Please try again.`);
			return;
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
