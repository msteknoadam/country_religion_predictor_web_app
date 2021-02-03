export const setCookie = (cname: string, cvalue: string, exdays = 1): void => {
	const d = new Date();
	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
	const expires = "expires=" + d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

export const getCookie = (cname: string): string => {
	const name = cname + "=";
	const decodedCookie = decodeURIComponent(document.cookie);
	const ca = decodedCookie.split(";");
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == " ") {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
};

export const error = (error: string): void => {
	let errorBox = document.createElement("div");
	errorBox.className = "errorBox";
	errorBox.innerText = error;
	errorBox.onclick = () => {
		if (errorBox && errorBox.parentElement) {
			errorBox.parentElement.removeChild(errorBox);
			errorBox = null;
		}
	};
	setTimeout(() => {
		if (errorBox && errorBox.parentElement) {
			errorBox.parentElement.removeChild(errorBox);
			errorBox = null;
		}
	}, 10e3);
	document.body.appendChild(errorBox);
};

export const setOnlineCount = (onlineCount: number): void => {
	(<HTMLSpanElement>document.querySelector(".onlineCount")).innerText = `${onlineCount}`;
};
