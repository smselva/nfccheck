import { autoFillDetail } from "./nfcform.js";
const loader = document.getElementById("loader");
function hideLoader() {
	loader.classList.remove("init-load");
	loader.classList.add("hide-loader");
}

function showLoader() {
	loader.classList.remove("hide-loader");
}

let themeColor = "#e2903f",
	isEditMode = false,
	recordId;

document.addEventListener("DOMContentLoaded", (event) => {
	ZOHO.CREATOR.init().then(async function () {
		var queryParams = ZOHO.CREATOR.UTIL.getQueryParams();
		loginUser = queryParams.user;
		if (queryParams.themeColor != "") {
			themeColor = queryParams.themeColor;

			recordId = queryParams.recId;
			if (recordId != undefined) {
				isEditMode = true;
			}
		}

		document.documentElement.style.setProperty("--theme-clr", themeColor);

		const { r, g, b } = hexToRGB(themeColor);
		let gradR = (r - 45 + 256) % 256;
		let gradG = (g - 35 + 256) % 256;
		let gradB = (b - 17 + 256) % 256;

		let shadowR = (r - 45 + 256) % 256;
		let shadowG = (g - 35 + 256) % 256;
		let shadowB = (b - 17 + 256) % 256;

		document.documentElement.style.setProperty("--grad-clr", `rgb(${gradR}, ${gradG}, ${gradB})`);
		document.documentElement.style.setProperty("--shadow-clr", `rgb(${shadowR}, ${shadowG}, ${shadowB})`);
		const style = document.createElement("style");
		style.innerHTML = `
			.stage:not(:last-child)::after {
				background: url("data:image/svg+xml,%3Csvg width='13' height='2' viewBox='0 0 13 2' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 1.27519L13 1.27504' stroke='%23${themeColor.replace(
					"#",
					"",
				)}' stroke-dasharray='3 3'/%3E%3C/svg%3E%0A");
			}`;
		document.head.appendChild(style);
		if (isEditMode) {
			onboardPage.classList.add("hide");
			nfcFormPage.classList.remove("hide");
			await autoFillDetail(recordId);
		}
		hideLoader();
	});
});

function hexToRGB(hex) {
	let r = parseInt(hex.substring(1, 3), 16);
	let g = parseInt(hex.substring(3, 5), 16);
	let b = parseInt(hex.substring(5, 7), 16);
	return { r, g, b };
}

const onboardPage = document.getElementById("onboard-page");
const nfcFormPage = document.getElementById("nfc-form-page");
const onboardScreens = document.getElementsByClassName("onboard-tab");
const screenButtons = document.getElementsByClassName("img-btn");
const btn = document.getElementById("proceed-to-nfc");
const initialPage = document.getElementById("initial-page");
let loginUser;

export function getLoginUser() {
	return loginUser;
}

export function getThemeColor() {
	return themeColor;
}

setInterval(function () {
	for (let index = 0; index < onboardScreens.length; index++) {
		onboardScreens[index].classList.toggle("active");
		screenButtons[index].classList.toggle("active");
	}
}, 3000);

btn.addEventListener("click", function () {
	onboardPage.classList.add("hide");
	nfcFormPage.classList.remove("hide");
});
