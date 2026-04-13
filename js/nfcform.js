import { getCard } from "./cards.js";
import { getLoginUser, getThemeColor } from "./onboarding.js";
import { initiateGooglePassCreation } from "./creategooglepass.js";

let countryUl, countryListUl;
const currentCountry = document.getElementById("country-selector");
const countryList = document.getElementById("country-list");
const overlay = document.createElement("div");
let formData;
overlay.className = "overlay";
overlay.addEventListener("click", function () {
	removeCountrySelect();
});

document.addEventListener("scroll", function () {
	removeCountrySelect();
});

// window.addEventListener("resize", function () {
// 	removeCountrySelect();
// });

let isEditMode = false,
	recordDetails,
	editRecordId;
const profilePicHidden = document.getElementById("profile-pic-hidden");
const logoHidden = document.getElementById("company-logo-hidden");
export async function autoFillDetail(recordId) {
	isEditMode = true;
	editRecordId = recordId;
	recordDetails = await getUploadedRecord(recordId);

	nameTag.value = recordDetails.Name;
	numberTag.value = recordDetails.Phone_Number.replace(recordDetails.Country_Code, "");
	currentCountry.querySelector(".current-country-code").innerText = `${recordDetails.Country_Code}`;
	emailTag.value = recordDetails.Email_Address;
	companyTag.value = recordDetails.Company_Name;
	roleTag.value = recordDetails.Role;

	addressLine1.value = recordDetails.Address?.address_line_1;
	addressLine2.value = recordDetails.Address?.address_line_2;
	city.value = recordDetails.Address?.district_city;
	state.value = recordDetails.Address?.state_province;
	postalcode.value = recordDetails.Address?.postal_code;
	if (recordDetails.Address?.country != "" && recordDetails.Address?.country != null) {
		country.classList.remove("default");
		country.innerText = recordDetails.Address?.country;
	}

	let profileFileName = recordDetails.Image.split("filepath=")[1] || "";
	if (profileFileName != "") {
		profilePicHidden.value = profileFileName;
		setFileName(
			profileFileName.substring(profileFileName.indexOf("_") + 1),
			profilePicHidden.nextElementSibling.nextElementSibling,
		);
	}

	let logoFileName = recordDetails.Logo.split("filepath=")[1] || "";
	logoHidden.value = logoFileName;
	setFileName(logoFileName.substring(logoFileName.indexOf("_") + 1), logoHidden.nextElementSibling.nextElementSibling);

	websiteLink.value = recordDetails.Website?.url ?? "";
	aboutTag.value = recordDetails.About;
	facebookLink.value = recordDetails.Facebook?.url ?? "";
	whatsappLink.value = recordDetails.Whatsapp?.url ?? "";
	linkedLink.value = recordDetails.LinkedIn?.url ?? "";
	xLink.value = recordDetails.X?.url ?? "";
	instagramLink.value = recordDetails.Instagram?.url ?? "";
	return;
}

function removeCountrySelect() {
	if (currentCountry.className.includes("active")) {
		countryUl.remove();
		currentCountry.classList.toggle("active");
	} else if (countryList.className.includes("active")) {
		countryListUl.remove();
		countryList.classList.toggle("active");
	}
	overlay.remove();
}

const noDataLi = document.createElement("li");
noDataLi.className = "option-li no-data-li";
noDataLi.innerHTML = `<span>No Data Matched</span>`;

function constructCountryList(countryCodeList) {
	countryUl = document.createElement("ul");
	countryUl.className = "country-dropdown";
	countryUl.style.setProperty("position", "fixed");

	countryListUl = document.createElement("ul");
	countryListUl.className = "country-dropdown";
	countryListUl.style.setProperty("position", "fixed");

	const countryUlSearch = document.createElement("li");
	countryUlSearch.className = "option-search";
	const countryUlSearchBox = document.createElement("input");
	countryUlSearchBox.id = "phone-search";
	countryUlSearchBox.name = "new-field";
	countryUlSearchBox.autocomplete = "off";
	countryUlSearchBox.addEventListener("input", function () {
		noDataLi.remove();
		const countryTags = this.parentElement.parentElement.children;
		let anyMatches = false;
		let searchValue = this.value.toLowerCase();
		for (let index = 1; index < countryTags.length; index++) {
			if (
				countryTags[index].getAttribute("data-dial-code").toLocaleLowerCase().includes(searchValue) ||
				countryTags[index].getAttribute("data-country-code").toLocaleLowerCase().includes(searchValue) ||
				countryTags[index].getAttribute("data-country-name").toLocaleLowerCase().includes(searchValue)
			) {
				anyMatches = true;
				countryTags[index].classList.remove("remove");
			} else {
				countryTags[index].classList.add("remove");
			}
		}
		if (!anyMatches) {
			this.parentElement.parentElement.appendChild(noDataLi);
		}
	});
	countryUlSearchBox.type = "text";
	countryUlSearchBox.placeholder = "Search";
	countryUlSearch.appendChild(countryUlSearchBox);
	countryUl.appendChild(countryUlSearch);

	const countryUlSearch1 = document.createElement("li");
	countryUlSearch1.className = "option-search";
	const countryUlSearchBox1 = document.createElement("input");
	countryUlSearchBox1.id = "country-search";
	countryUlSearchBox1.name = "new-field";
	countryUlSearchBox1.autocomplete = "off";
	countryUlSearchBox1.addEventListener("input", function () {
		noDataLi.remove();
		const countryTags = this.parentElement.parentElement.children;
		let anyMatches = false;
		let searchValue = this.value.toLowerCase();
		for (let index = 1; index < countryTags.length; index++) {
			if (countryTags[index].getAttribute("data-country-name").toLocaleLowerCase().includes(searchValue)) {
				anyMatches = true;
				countryTags[index].classList.remove("remove");
			} else {
				countryTags[index].classList.add("remove");
			}
		}
		if (!anyMatches) {
			this.parentElement.parentElement.appendChild(noDataLi);
		}
	});
	countryUlSearchBox1.type = "text";
	countryUlSearchBox1.placeholder = "Search";
	countryUlSearch1.appendChild(countryUlSearchBox1);
	countryListUl.appendChild(countryUlSearch1);
	countryCodeList.forEach((country) => {
		const countryLi = document.createElement("li");
		countryLi.className = "option-li";
		countryLi.innerHTML = `<span class="dialcode">${country.dialCode}</span> <span class="country-name">${country.name}</span>`;
		countryLi.addEventListener("click", function () {
			currentCountry.classList.toggle("active");
			currentCountry.querySelector(".current-country-code").innerText = this.getAttribute("data-dial-code");
			countryUl.remove();
			overlay.remove();
		});
		countryLi.setAttribute("data-dial-code", country.dialCode);
		countryLi.setAttribute("data-country-code", country.iso);
		countryLi.setAttribute("data-country-name", country.name);
		countryUl.appendChild(countryLi);

		let countryName = country.name
			.substr(0, country.name.indexOf("(") != -1 ? country.name.indexOf("(") : country.name.length)
			.trim();
		const countryLi1 = document.createElement("li");
		countryLi1.className = "option-li";
		countryLi1.innerHTML = `<span class="country-name">${countryName}</span>`;
		countryLi1.style.setProperty("padding-left", "10px");
		countryLi1.addEventListener("click", function () {
			countryList.classList.toggle("active");
			const countryListPlaceHolder = countryList.querySelector(".current-country");
			countryListPlaceHolder.classList.remove("default");
			countryListPlaceHolder.innerText = this.getAttribute("data-country-name");
			countryListUl.remove();
			overlay.remove();
		});
		countryLi1.setAttribute("data-country-name", countryName);
		countryListUl.appendChild(countryLi1);
	});
}

currentCountry.addEventListener("click", function (e) {
	const phoneInput = countryUl.querySelector("#phone-search");
	phoneInput.value = "";
	const countryTags = phoneInput.parentElement.parentElement.children;
	for (let index = 1; index < countryTags.length; index++) {
		countryTags[index].classList.remove("remove");
	}
	noDataLi.remove();
	this.classList.toggle("active");

	if (this.className.includes("active")) {
		const positionValues = getPosition(this);
		const parentEle = this.closest(".phone-number-wrapper");

		let fieldHeight = 40 + 5;
		let yPosition = positionValues.y + fieldHeight;
		let xPosition = positionValues.x;
		countryUl.style.setProperty("width", `${parentEle.clientWidth}px`);
		countryUl.style.setProperty("top", `${yPosition}px`);
		countryUl.style.setProperty("left", `${xPosition}px`);
		document.body.append(overlay, countryUl);
	} else {
		overlay.remove();
		countryUl.remove();
	}
});

countryList.addEventListener("click", function (e) {
	const countryInput = countryListUl.querySelector("#country-search");
	countryInput.value = "";
	const countryTags = countryInput.parentElement.parentElement.children;
	for (let index = 1; index < countryTags.length; index++) {
		countryTags[index].classList.remove("remove");
	}
	noDataLi.remove();
	this.classList.toggle("active");

	if (this.className.includes("active")) {
		const positionValues = getPosition(this);
		let xPosition = positionValues.x;
		let yPosition = document.body.clientHeight - positionValues.y + 5;
		countryListUl.style.setProperty("width", `${this.clientWidth}px`);
		countryListUl.style.setProperty("bottom", `${yPosition}px`);
		countryListUl.style.setProperty("left", `${xPosition}px`);
		document.body.append(overlay, countryListUl);
	} else {
		overlay.remove();
		countryListUl.remove();
	}
});

function getPosition(el) {
	var xPosition = 0;
	var yPosition = 0;

	while (el) {
		if (el.tagName == "BODY") {
			var xScrollPos = el.scrollLeft || document.documentElement.scrollLeft;
			var yScrollPos = el.scrollTop || document.documentElement.scrollTop;

			xPosition += el.offsetLeft - xScrollPos + el.clientLeft;
			yPosition += el.offsetTop - yScrollPos + el.clientTop;
		} else {
			xPosition += el.offsetLeft - el.scrollLeft + el.clientLeft;
			yPosition += el.offsetTop - el.scrollTop + el.clientTop;
		}

		el = el.offsetParent;
	}
	return {
		x: xPosition,
		y: yPosition,
	};
}

fetch("./assets/countycode.json")
	.then((response) => {
		return response.json();
	})
	.then((data) => {
		constructCountryList(data);
	});

const mainPage = document.getElementById("nfc-form-page");
const stage = document.getElementById("stage-info");
const additionalBackBtn = document.getElementById("additional-back");
additionalBackBtn.addEventListener("click", function () {
	const currentForm = this.closest(".additional-info-form");
	currentForm.classList.toggle("hide");
	currentForm.previousElementSibling.classList.toggle("hide");
	mainPage.scrollTop = 0;

	const generalStage = stage.querySelector(".general-stage");
	generalStage.classList.add("current-stage");
	generalStage.classList.remove("prev-stage");
	stage.querySelector(".add-stage").classList.remove("current-stage");
});

const generalNextBtn = document.getElementById("general-next");
generalNextBtn.addEventListener("click", function (e) {
	e.preventDefault();

	if (validateGeneralFormPage()) {
		const currentForm = this.closest(".general-info-form");
		currentForm.classList.toggle("hide");
		currentForm.nextElementSibling.classList.toggle("hide");
		mainPage.scrollTop = 0;
		const generalStage = stage.querySelector(".general-stage");
		generalStage.classList.remove("current-stage");
		generalStage.classList.add("prev-stage");
		stage.querySelector(".add-stage").classList.add("current-stage");
	}
});

const additionalNextBtn = document.getElementById("additional-next");
additionalNextBtn.addEventListener("click", function (e) {
	e.preventDefault();

	if (validateAdditionalFormPage()) {
		const currentForm = this.closest(".additional-info-form");
		currentForm.classList.add("hide");
		currentForm.previousElementSibling.classList.add("hide");

		const addStage = stage.querySelector(".add-stage");
		addStage.classList.remove("current-stage");
		addStage.classList.add("prev-stage");
		stage.querySelector(".final-stage").classList.add("current-stage");

		currentForm.nextElementSibling.classList.remove("hide");
		constructJSON();
	}
});

const addressLine1 = document.getElementById("address1");
const addressLine2 = document.getElementById("address2");
const city = document.getElementById("city");
const state = document.getElementById("state");
const postalcode = document.getElementById("postal-code");
const country = countryList.querySelector(".current-country");

function constructJSON() {
	let dataJSON = {};
	dataJSON.Name = nameTag.value;
	dataJSON.Country_Code = currentCountry.innerText.trim();
	dataJSON.Phone_Number = currentCountry.innerText.trim() + "" + numberTag.value.trim();
	dataJSON.Email_Address = emailTag.value;
	dataJSON.Company_Name = companyTag.value;
	dataJSON.Role = roleTag.value;
	dataJSON.Website = { url: websiteLink.value && ensureHttps(websiteLink.value) };
	dataJSON.About = aboutTag.value;
	dataJSON.Facebook = { url: facebookLink.value && ensureHttps(facebookLink.value) };
	dataJSON.Whatsapp = { url: whatsappLink.value && ensureHttps(whatsappLink.value) };
	dataJSON.LinkedIn = { url: linkedLink.value && ensureHttps(linkedLink.value) };
	dataJSON.Instagram = { url: instagramLink.value && ensureHttps(instagramLink.value) };
	dataJSON.X = { url: xLink.value && ensureHttps(xLink.value) };
	dataJSON.Address = {
		address_line_1: addressLine1.value.trim(),
		address_line_2: addressLine2.value.trim(),
		district_city: city.value.trim(),
		state_province: state.value.trim(),
		postal_Code: postalcode.value.trim(),
		country: !country.className.includes("default") ? country.innerText : "",
	};
	buildCardInfo(dataJSON);
}

const cardWrapper = document.getElementById("card-info-wrapper");
function buildCardInfo(data) {
	cardWrapper.innerHTML = "";
	let profileImgSrc = profilePic.files[0];
	let profileName = data.Name;
	let profileRole = data.Role;
	let profileCompany = data.Company_Name;
	let aboutContent = data.About;
	// const cardViewer = document.createElement("div");
	// cardViewer.className = "card-viewer";
	// cardViewer.append(getCard(1, "front", data), getCard(1, "back", data));

	const generalInfo = document.createElement("div");
	generalInfo.className = "general-info-wrapper";

	const profileWrapper = document.createElement("div");
	profileWrapper.className = "profile-wrapper";
	const profileImgTag = document.createElement("img");
	profileImgTag.className = "profile-image";
	profileImgTag.id = "card-profile-image";

	if (profileImgSrc) {
		const imageURL = URL.createObjectURL(profileImgSrc);
		profileImgTag.src = imageURL;
		profileImgTag.onload = () => {
			URL.revokeObjectURL(imageURL);
		};
	} else if (isEditMode && recordDetails.Image != "") {
		profileImgTag.src = recordDetails.Profile_Public_Link;
	} else {
		profileImgTag.src = "./assets/user.svg";
	}

	const profileNameTag = document.createElement("div");
	profileNameTag.className = "profile-name";
	profileNameTag.innerText = profileName;
	const profileRoleTag = document.createElement("div");
	profileRoleTag.className = "profile-role";
	profileRoleTag.innerText = profileRole;
	const profileCompanyTag = document.createElement("div");
	profileCompanyTag.className = "profile-company";
	profileCompanyTag.innerText = profileCompany;
	profileWrapper.append(profileImgTag, profileNameTag, profileRoleTag, profileCompanyTag);

	const aboutWrapper = document.createElement("div");
	aboutWrapper.className = "about-content-wrapper";
	const aboutWrapperHeaderWrapper = document.createElement("div");
	aboutWrapperHeaderWrapper.className = "about-wrapper-container";
	const aboutWrapperHeader = document.createElement("div");
	aboutWrapperHeader.className = "about-header";
	aboutWrapperHeader.innerText = "About";
	const editProfile = document.createElement("div");
	editProfile.innerHTML =
		'<svg class="edit-profile" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.3563 4.05587L13.944 5.64362M13.377 2.65712L9.08175 6.95237C8.85916 7.1735 8.70768 7.45608 8.64675 7.76387L8.25 9.74987L10.236 9.35237C10.5435 9.29087 10.8255 9.14012 11.0475 8.91812L15.3428 4.62287C15.4718 4.4938 15.5742 4.34057 15.6441 4.17192C15.7139 4.00328 15.7499 3.82253 15.7499 3.64C15.7499 3.45746 15.7139 3.27671 15.6441 3.10807C15.5742 2.93942 15.4718 2.78619 15.3428 2.65712C15.2137 2.52805 15.0604 2.42566 14.8918 2.35581C14.7232 2.28595 14.5424 2.25 14.3599 2.25C14.1773 2.25 13.9966 2.28595 13.8279 2.35581C13.6593 2.42566 13.5061 2.52805 13.377 2.65712Z" stroke="var(--theme-clr, #e2903f)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.25 11.25V13.5C14.25 13.8978 14.092 14.2794 13.8107 14.5607C13.5294 14.842 13.1478 15 12.75 15H4.5C4.10218 15 3.72064 14.842 3.43934 14.5607C3.15804 14.2794 3 13.8978 3 13.5V5.25C3 4.85218 3.15804 4.47064 3.43934 4.18934C3.72064 3.90804 4.10218 3.75 4.5 3.75H6.75" stroke="var(--theme-clr, #e2903f)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
	editProfile.addEventListener("click", function () {
		const addtionalForm = document.getElementById("additional-form");
		addtionalForm.classList.remove("hide");
		mainPage.scrollTop = 0;

		const addStage = stage.querySelector(".add-stage");
		addStage.classList.remove("prev-stage");
		addStage.classList.add("current-stage");
		stage.querySelector(".final-stage").classList.remove("current-stage");

		addtionalForm.nextElementSibling.classList.add("hide");
	});
	aboutWrapperHeaderWrapper.append(aboutWrapperHeader, editProfile);
	const aboutContentTag = document.createElement("div");
	aboutContentTag.className = "about-content";
	aboutContentTag.innerText = aboutContent;
	const socialMedia = document.createElement("div");
	socialMedia.className = "social-media-info";

	if (data.Website.url != "") {
		const websiteLink = getLinkNode("website", data.Website.url);
		socialMedia.append(websiteLink);
	}

	if (data.LinkedIn.url != "") {
		const linkedinLink = getLinkNode("linkedin", data.LinkedIn.url);
		socialMedia.append(linkedinLink);
	}

	if (data.Instagram.url != "") {
		const instagramLink = getLinkNode("instagram", data.Instagram.url);
		socialMedia.append(instagramLink);
	}

	if (data.Whatsapp.url != "") {
		const whatsappLink = getLinkNode("whatsapp", data.Whatsapp.url);
		socialMedia.append(whatsappLink);
	}

	if (data.Facebook.url != "") {
		const facebookLink = getLinkNode("facebook", data.Facebook.url);
		socialMedia.append(facebookLink);
	}

	if (data.X.url != "") {
		const xLink = getLinkNode("x", data.X.url);
		socialMedia.append(xLink);
	}

	aboutWrapper.append(aboutWrapperHeaderWrapper, aboutContentTag, socialMedia);
	generalInfo.append(profileWrapper, aboutWrapper);

	cardWrapper.appendChild(generalInfo);
	formData = data;
}

function getLinkNode(linkFor, link) {
	const atag = document.createElement("a");
	atag.className = "contact-url";
	atag.href = link;
	atag.setAttribute("target", "_blank");
	if (linkFor == "website") {
		atag.innerHTML =
			'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.2429 5.04286L12.7286 3.55714C13.4714 2.81429 14.9571 2.81429 15.7 3.55714L16.4429 4.3C17.1857 5.04286 17.1857 6.52857 16.4429 7.27143L12.7286 10.9857C11.9857 11.7286 10.5 11.7286 9.75714 10.9857M9.75714 13.9571L8.27143 15.4429C7.52857 16.1857 6.04286 16.1857 5.3 15.4429L4.55714 14.7C3.81429 13.9571 3.81429 12.4714 4.55714 11.7286L8.27143 8.01429C9.01429 7.27143 10.5 7.27143 11.2429 8.01429" stroke="#333333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
	} else if (linkFor == "linkedin") {
		atag.innerHTML =
			'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.78353 4.16652C5.78331 4.60855 5.6075 5.03239 5.29478 5.34479C4.98207 5.6572 4.55806 5.83258 4.11603 5.83236C3.674 5.83214 3.25017 5.65633 2.93776 5.34361C2.62536 5.0309 2.44997 4.60688 2.4502 4.16486C2.45042 3.72283 2.62622 3.29899 2.93894 2.98659C3.25166 2.67419 3.67567 2.4988 4.1177 2.49902C4.55972 2.49924 4.98356 2.67505 5.29596 2.98777C5.60837 3.30049 5.78375 3.7245 5.78353 4.16652ZM5.83353 7.06652H2.5002V17.4999H5.83353V7.06652ZM11.1002 7.06652H7.78353V17.4999H11.0669V12.0249C11.0669 8.97486 15.0419 8.69152 15.0419 12.0249V17.4999H18.3335V10.8915C18.3335 5.74986 12.4502 5.94152 11.0669 8.46652L11.1002 7.06652Z" fill="#333333"/></svg>';
	} else if (linkFor == "instagram") {
		atag.innerHTML =
			'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.49984 1.66699H13.4998C16.1665 1.66699 18.3332 3.83366 18.3332 6.50033V13.5003C18.3332 14.7822 17.8239 16.0116 16.9175 16.918C16.0111 17.8244 14.7817 18.3337 13.4998 18.3337H6.49984C3.83317 18.3337 1.6665 16.167 1.6665 13.5003V6.50033C1.6665 5.21845 2.17573 3.98907 3.08215 3.08264C3.98858 2.17622 5.21796 1.66699 6.49984 1.66699ZM6.33317 3.33366C5.53752 3.33366 4.77446 3.64973 4.21185 4.21234C3.64924 4.77495 3.33317 5.53801 3.33317 6.33366V13.667C3.33317 15.3253 4.67484 16.667 6.33317 16.667H13.6665C14.4622 16.667 15.2252 16.3509 15.7878 15.7883C16.3504 15.2257 16.6665 14.4626 16.6665 13.667V6.33366C16.6665 4.67533 15.3248 3.33366 13.6665 3.33366H6.33317ZM14.3748 4.58366C14.6511 4.58366 14.9161 4.69341 15.1114 4.88876C15.3068 5.08411 15.4165 5.34906 15.4165 5.62533C15.4165 5.90159 15.3068 6.16654 15.1114 6.3619C14.9161 6.55725 14.6511 6.66699 14.3748 6.66699C14.0986 6.66699 13.8336 6.55725 13.6383 6.3619C13.4429 6.16654 13.3332 5.90159 13.3332 5.62533C13.3332 5.34906 13.4429 5.08411 13.6383 4.88876C13.8336 4.69341 14.0986 4.58366 14.3748 4.58366ZM9.99984 5.83366C11.1049 5.83366 12.1647 6.27265 12.9461 7.05405C13.7275 7.83545 14.1665 8.89526 14.1665 10.0003C14.1665 11.1054 13.7275 12.1652 12.9461 12.9466C12.1647 13.728 11.1049 14.167 9.99984 14.167C8.89477 14.167 7.83496 13.728 7.05356 12.9466C6.27216 12.1652 5.83317 11.1054 5.83317 10.0003C5.83317 8.89526 6.27216 7.83545 7.05356 7.05405C7.83496 6.27265 8.89477 5.83366 9.99984 5.83366ZM9.99984 7.50033C9.3368 7.50033 8.70091 7.76372 8.23207 8.23256C7.76323 8.7014 7.49984 9.33728 7.49984 10.0003C7.49984 10.6634 7.76323 11.2993 8.23207 11.7681C8.70091 12.2369 9.3368 12.5003 9.99984 12.5003C10.6629 12.5003 11.2988 12.2369 11.7676 11.7681C12.2364 11.2993 12.4998 10.6634 12.4998 10.0003C12.4998 9.33728 12.2364 8.7014 11.7676 8.23256C11.2988 7.76372 10.6629 7.50033 9.99984 7.50033Z" fill="#333333"/></svg>';
	} else if (linkFor == "whatsapp") {
		atag.innerHTML =
			'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.8752 4.09204C15.1111 3.32046 14.201 2.70868 13.1981 2.29234C12.1952 1.876 11.1194 1.66344 10.0335 1.66704C5.4835 1.66704 1.77516 5.37537 1.77516 9.92537C1.77516 11.3837 2.1585 12.8004 2.87516 14.0504L1.7085 18.3337L6.0835 17.1837C7.29183 17.842 8.65016 18.192 10.0335 18.192C14.5835 18.192 18.2918 14.4837 18.2918 9.9337C18.2918 7.72537 17.4335 5.65037 15.8752 4.09204ZM10.0335 16.792C8.80016 16.792 7.59183 16.4587 6.5335 15.8337L6.2835 15.6837L3.6835 16.367L4.37516 13.8337L4.2085 13.5754C3.52312 12.4813 3.15927 11.2164 3.1585 9.92537C3.1585 6.14204 6.24183 3.0587 10.0252 3.0587C11.8585 3.0587 13.5835 3.77537 14.8752 5.07537C15.5148 5.71192 16.0218 6.46916 16.3665 7.30314C16.7113 8.13713 16.887 9.03128 16.8835 9.9337C16.9002 13.717 13.8168 16.792 10.0335 16.792ZM13.8002 11.6587C13.5918 11.5587 12.5752 11.0587 12.3918 10.9837C12.2002 10.917 12.0668 10.8837 11.9252 11.0837C11.7835 11.292 11.3918 11.7587 11.2752 11.892C11.1585 12.0337 11.0335 12.0504 10.8252 11.942C10.6168 11.842 9.95016 11.617 9.16683 10.917C8.55016 10.367 8.14183 9.69204 8.01683 9.4837C7.90016 9.27537 8.00016 9.16704 8.1085 9.0587C8.20016 8.96704 8.31683 8.81704 8.41683 8.70037C8.51683 8.5837 8.5585 8.49204 8.62516 8.3587C8.69183 8.21704 8.6585 8.10037 8.6085 8.00037C8.5585 7.90037 8.14183 6.8837 7.97516 6.46704C7.8085 6.06704 7.6335 6.11704 7.5085 6.1087H7.1085C6.96683 6.1087 6.75016 6.1587 6.5585 6.36704C6.37516 6.57537 5.84183 7.07537 5.84183 8.09204C5.84183 9.1087 6.5835 10.092 6.6835 10.2254C6.7835 10.367 8.14183 12.4504 10.2085 13.342C10.7002 13.5587 11.0835 13.6837 11.3835 13.7754C11.8752 13.9337 12.3252 13.9087 12.6835 13.8587C13.0835 13.8004 13.9085 13.3587 14.0752 12.8754C14.2502 12.392 14.2502 11.9837 14.1918 11.892C14.1335 11.8004 14.0085 11.7587 13.8002 11.6587Z" fill="#333333"/></svg>';
	} else if (linkFor == "facebook") {
		atag.innerHTML =
			'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.3332 10.0003C18.3332 5.40033 14.5998 1.66699 9.99984 1.66699C5.39984 1.66699 1.6665 5.40033 1.6665 10.0003C1.6665 14.0337 4.53317 17.392 8.33317 18.167V12.5003H6.6665V10.0003H8.33317V7.91699C8.33317 6.30866 9.6415 5.00033 11.2498 5.00033H13.3332V7.50033H11.6665C11.2082 7.50033 10.8332 7.87533 10.8332 8.33366V10.0003H13.3332V12.5003H10.8332V18.292C15.0415 17.8753 18.3332 14.3253 18.3332 10.0003Z" fill="#333333"/></svg>';
	} else if (linkFor == "x") {
		atag.innerHTML =
			'<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5222 8.775L17.4785 2H16.0669L10.8952 7.8825L6.76444 2H2L8.24655 10.8955L2 18H3.4116L8.87328 11.7879L13.2356 18H18L11.5222 8.775ZM9.58891 10.9738L8.95593 10.088L3.92016 3.03975H6.08827L10.152 8.728L10.7849 9.61375L16.0676 17.0075H13.8997L9.58891 10.9738Z" fill="#333333"/></svg>';
	}
	return atag;
}

function ensureHttps(url) {
	if (!/^https?:\/\//i.test(url)) {
		return "https://" + url;
	}
	return url;
}

const nameTag = document.getElementById("name");
const numberTag = document.getElementById("phone-number");
const emailTag = document.getElementById("email");
const companyTag = document.getElementById("company-name");
const roleTag = document.getElementById("role");
const profilePic = document.getElementById("profile-pic");
const websiteLink = document.getElementById("website-link");
const companyLogoTag = document.getElementById("company-logo");
const aboutTag = document.getElementById("about");
const facebookLink = document.getElementById("facebook-link");
const whatsappLink = document.getElementById("whatsapp-link");
const linkedLink = document.getElementById("linkedin-link");
const xLink = document.getElementById("x-link");
const instagramLink = document.getElementById("instagram-link");

export function getCompanyLogo() {
	return companyLogoTag.files[0];
}

facebookLink.addEventListener("change", function () {
	const parentTag = facebookLink.closest(".field-wrapper");
	if (isValidURL(this.value)) {
		parentTag.classList.remove("invalid");
		parentTag.removeAttribute("data-error-msg");
	} else {
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "URL entered is invalid");
	}
});

facebookLink.addEventListener("focus", function () {
	const parentTag = facebookLink.closest(".field-wrapper");
	parentTag.classList.remove("invalid");
	parentTag.removeAttribute("data-error-msg");
});

facebookLink.addEventListener("focusout", function () {
	const parentTag = facebookLink.closest(".field-wrapper");
	if (this.value.trim() != "" && !isValidURL(this.value)) {
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "URL entered is invalid");
	} else {
		parentTag.classList.remove("invalid");
		parentTag.removeAttribute("data-error-msg");
	}
});

whatsappLink.addEventListener("change", function () {
	const parentTag = whatsappLink.closest(".field-wrapper");
	if (isValidURL(this.value)) {
		parentTag.classList.remove("invalid");
		parentTag.removeAttribute("data-error-msg");
	} else {
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "URL entered is invalid");
	}
});

whatsappLink.addEventListener("focus", function () {
	const parentTag = whatsappLink.closest(".field-wrapper");
	parentTag.classList.remove("invalid");
	parentTag.removeAttribute("data-error-msg");
});

aboutTag.addEventListener("focus", function () {
	const parentTag = aboutTag.closest(".field-wrapper");
	parentTag.classList.remove("invalid");
	parentTag.removeAttribute("data-error-msg");
});

whatsappLink.addEventListener("focusout", function () {
	const parentTag = whatsappLink.closest(".field-wrapper");
	if (this.value.trim() != "" && !isValidURL(this.value)) {
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "URL entered is invalid");
	} else {
		parentTag.classList.remove("invalid");
		parentTag.removeAttribute("data-error-msg");
	}
});

linkedLink.addEventListener("change", function () {
	const parentTag = linkedLink.closest(".field-wrapper");
	if (isValidURL(this.value)) {
		parentTag.classList.remove("invalid");
		parentTag.removeAttribute("data-error-msg");
	} else {
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "URL entered is invalid");
	}
});

linkedLink.addEventListener("focus", function () {
	const parentTag = linkedLink.closest(".field-wrapper");
	parentTag.classList.remove("invalid");
	parentTag.removeAttribute("data-error-msg");
});

linkedLink.addEventListener("focusout", function () {
	const parentTag = linkedLink.closest(".field-wrapper");
	if (this.value.trim() != "" && !isValidURL(this.value)) {
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "URL entered is invalid");
	} else {
		parentTag.classList.remove("invalid");
		parentTag.removeAttribute("data-error-msg");
	}
});

xLink.addEventListener("change", function () {
	const parentTag = xLink.closest(".field-wrapper");
	if (isValidURL(this.value)) {
		parentTag.classList.remove("invalid");
		parentTag.removeAttribute("data-error-msg");
	} else {
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "URL entered is invalid");
	}
});

xLink.addEventListener("focus", function () {
	const parentTag = xLink.closest(".field-wrapper");
	parentTag.classList.remove("invalid");
	parentTag.removeAttribute("data-error-msg");
});

xLink.addEventListener("focusout", function () {
	const parentTag = xLink.closest(".field-wrapper");
	if (this.value.trim() != "" && !isValidURL(this.value)) {
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "URL entered is invalid");
	} else {
		parentTag.classList.remove("invalid");
		parentTag.removeAttribute("data-error-msg");
	}
});

instagramLink.addEventListener("change", function () {
	const parentTag = instagramLink.closest(".field-wrapper");
	if (isValidURL(this.value)) {
		parentTag.classList.remove("invalid");
		parentTag.removeAttribute("data-error-msg");
	} else {
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "URL entered is invalid");
	}
});

instagramLink.addEventListener("focus", function () {
	const parentTag = instagramLink.closest(".field-wrapper");
	parentTag.classList.remove("invalid");
	parentTag.removeAttribute("data-error-msg");
});

instagramLink.addEventListener("focusout", function () {
	const parentTag = instagramLink.closest(".field-wrapper");
	if (this.value.trim() != "" && !isValidURL(this.value)) {
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "URL entered is invalid");
	} else {
		parentTag.classList.remove("invalid");
		parentTag.removeAttribute("data-error-msg");
	}
});

websiteLink.addEventListener("change", function () {
	const parentTag = websiteLink.closest(".field-wrapper");
	if (isValidURL(this.value)) {
		parentTag.classList.remove("invalid");
		parentTag.removeAttribute("data-error-msg");
	} else {
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "URL entered is invalid");
	}
});

websiteLink.addEventListener("focus", function () {
	const parentTag = websiteLink.closest(".field-wrapper");
	parentTag.classList.remove("invalid");
	parentTag.removeAttribute("data-error-msg");
});

websiteLink.addEventListener("focusout", function () {
	const parentTag = websiteLink.closest(".field-wrapper");
	if (this.value.trim() != "" && !isValidURL(this.value)) {
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "URL entered is invalid");
	} else {
		parentTag.classList.remove("invalid");
		parentTag.removeAttribute("data-error-msg");
	}
});

nameTag.addEventListener("focus", function () {
	const parentTag = nameTag.closest(".field-wrapper");
	parentTag.classList.remove("invalid");
	parentTag.removeAttribute("data-error-msg");
});

numberTag.addEventListener("focus", function () {
	const parentTag = numberTag.closest(".field-wrapper");
	parentTag.classList.remove("invalid");
	parentTag.removeAttribute("data-error-msg");
});

numberTag.addEventListener("input", function (e) {
	this.value = this.value.replace(/\./g, "");
});

numberTag.addEventListener("keydown", function (e) {
	if (e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab" && !e.key.match(/^[0-9]$/)) {
		e.preventDefault();
	}
});

emailTag.addEventListener("focus", function () {
	const parentTag = emailTag.closest(".field-wrapper");
	parentTag.classList.remove("invalid");
	parentTag.removeAttribute("data-error-msg");
	this.dataset.prevValue = this.value;
});

emailTag.addEventListener("focusout", function () {
	// const parentTag = emailTag.closest(".field-wrapper");
	// if (this.value.trim() != "" && !validEmail(this.value)) {
	// 	parentTag.classList.add("invalid");
	// 	parentTag.setAttribute("data-error-msg", "Email entered is invalid");
	// } else {
	// 	parentTag.classList.remove("invalid");
	// 	parentTag.removeAttribute("data-error-msg");
	// }
});

emailTag.addEventListener("change", function () {
	const parentTag = emailTag.closest(".field-wrapper");
	const parentWrapper = this.closest(".field-overall-wrapper");
	if (this.value != "") {
		if (!validEmail(this.value)) {
			parentTag.classList.add("invalid");
			parentTag.setAttribute("data-error-msg", "Email entered is invalid");
		} else {
			if (this.dataset.prevValue != this.value) {
				// parentTag.classList.add("validating");
				// checkIfAlreadyExists(emailTag.value).then((exists) => {
				// parentTag.classList.remove("validating");
				// if (exists) {
				// 	parentTag.classList.add("invalid");
				// 	parentTag.setAttribute("data-error-msg", "Email entered is already present");
				// } else {
				// parentTag.classList.remove("invalid");
				// parentTag.removeAttribute("data-error-msg");
				// }
				// });

				parentTag.classList.add("validating");
				checkIfPrevExists(emailTag.value, getLoginUser()).then((exists) => {
					parentTag.classList.remove("validating");

					if (exists) {
						try {
							parentWrapper.querySelector(".record-exist-alert").remove();
						} catch (e) {}

						const div = document.createElement("div");
						div.className = "record-exist-alert";
						const spanTag = document.createElement("span");
						spanTag.innerText = " other cards associated with this email.";
						const atag = document.createElement("span");
						atag.className = "report-link";
						atag.innerText = "View";
						atag.addEventListener("click", function () {
							// let reportName;
							// if (getuserPermission() == "personal") {
							let reportName = "E_Cards";
							// } else if (getuserPermission() == "public") {
							// 	reportName = "E_Cards";
							// } else {
							// 	reportName = "NFC_Report";
							// }
							var param = {
								action: "open",
								url: `#Report:${reportName}?Email_Address=${emailTag.value}&zc_LoadIn=dialog&zc_SecHeader=false`,
								window: "same",
							};
							ZOHO.CREATOR.UTIL.navigateParentURL(param);
						});
						div.append(atag, spanTag);
						parentWrapper.appendChild(div);
					} else {
						try {
							parentWrapper.querySelector(".record-exist-alert").remove();
						} catch (e) {}
					}
				});
			}
		}
	} else {
		parentWrapper.querySelector(".record-exist-alert").remove();
	}
});

async function checkIfAlreadyExists(email) {
	try {
		await ZOHO.CREATOR.init();

		let config = {
			reportName: "NFC_Report",
			criteria: `(Email_Address == "${email}")`,
		};

		let response = await ZOHO.CREATOR.API.getAllRecords(config);

		if (response.code === 3000) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		return false;
	}
}

async function checkIfPrevExists(email, loginUser) {
	try {
		await ZOHO.CREATOR.init();

		let config = {
			reportName: "NFC_Report",
			criteria: `(Email_Address == "${email}" && Added_User == "${loginUser}" && Completed == true)`,
		};

		let response = await ZOHO.CREATOR.API.getAllRecords(config);

		if (response.code === 3000) {
			return true;
		} else {
			return false;
		}
	} catch (error) {
		return false;
	}
}

function validEmail(e) {
	const patt = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return patt.test(e);
}

function isValidURL(url) {
	const pattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,6}(\/[^\s?#]*)?(\?[^\s#]*)?(#[^\s]*)?$/;
	return pattern.test(url);
}

companyTag.addEventListener("focus", function () {
	const parentTag = companyTag.closest(".field-wrapper");
	parentTag.classList.remove("invalid");
	parentTag.removeAttribute("data-error-msg");
});

roleTag.addEventListener("focus", function () {
	const parentTag = roleTag.closest(".field-wrapper");
	parentTag.classList.remove("invalid");
	parentTag.removeAttribute("data-error-msg");
});

function validateAdditionalFormPage() {
	let isValid = true;
	if (
		(!isEditMode && companyLogoTag.files.length == 0) ||
		(isEditMode && logoHidden.value == "" && companyLogoTag.files.length == 0)
	) {
		isValid = false;
		const parentTag = companyLogoTag.closest(".field-wrapper");
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "Company Logo is mandatory");
	}

	if (aboutTag.value == "") {
		isValid = false;
		const parentTag = aboutTag.closest(".field-wrapper");
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "About is mandatory");
	}

	if (websiteLink.value != "" && !isValidURL(websiteLink.value)) {
		isValid = false;
	}

	if (facebookLink.value != "" && !isValidURL(facebookLink.value)) {
		isValid = false;
	}

	if (linkedLink.value != "" && !isValidURL(linkedLink.value)) {
		isValid = false;
	}

	if (instagramLink.value != "" && !isValidURL(instagramLink.value)) {
		isValid = false;
	}

	if (xLink.value != "" && !isValidURL(xLink.value)) {
		isValid = false;
	}

	if (whatsappLink.value != "" && !isValidURL(whatsappLink.value)) {
		isValid = false;
	}
	return isValid;
}

function validateGeneralFormPage() {
	let isValid = true;

	if (nameTag.value == "") {
		isValid = false;
		const parentTag = nameTag.closest(".field-wrapper");
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "Name is mandatory");
	}

	if (numberTag.value == "") {
		isValid = false;
		const parentTag = numberTag.closest(".field-wrapper");
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "Phone Number is mandatory");
	}

	if (emailTag.value == "") {
		isValid = false;
		const parentTag = emailTag.closest(".field-wrapper");
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "Email Address is mandatory");
	} else if (
		(emailTag.value != "" && !validEmail(emailTag.value)) ||
		emailTag.closest(".field-wrapper").className.includes("invalid") ||
		emailTag.closest(".field-wrapper").className.includes("validating")
	) {
		isValid = false;
	}

	if (companyTag.value == "") {
		isValid = false;
		const parentTag = companyTag.closest(".field-wrapper");
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "Company Name is mandatory");
	}

	if (roleTag.value == "") {
		isValid = false;
		const parentTag = roleTag.closest(".field-wrapper");
		parentTag.classList.add("invalid");
		parentTag.setAttribute("data-error-msg", "Role is mandatory");
	}

	return isValid;
}

profilePic.addEventListener("change", function (event) {
	showFileName(event, this);
});

companyLogoTag.addEventListener("change", function (event) {
	showFileName(event, this);
});

function showFileName(event, ele) {
	const files = event.target.files;
	if (files.length > 0) {
		setFileName(files[0].name, ele.nextElementSibling);
	}
}

function setFileName(fileName, ele) {
	// ele.innerHTML = "Upload your Image";
	ele.closest(".field-wrapper").classList.remove("invalid");
	const fileDiv = document.createElement("div");
	fileDiv.className = "file-cont";

	const span = document.createElement("span");
	span.innerText = fileName;

	const svgTag1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svgTag1.setAttribute("class", "remove-file");
	svgTag1.addEventListener("click", function (e) {
		e.preventDefault();
		if (isEditMode && logoHidden.value != "") {
			logoHidden.value = "";
		}
		this.closest(".field-wrapper").querySelector("input").value = "";
		this.closest(".file-input-label").innerHTML = "Upload your Image";
	});
	svgTag1.setAttribute("viewBox", "0 0 12 12");
	svgTag1.setAttribute("fill", "none");

	const pathTag11 = document.createElementNS("http://www.w3.org/2000/svg", "path");
	pathTag11.setAttribute("d", "M10.5 1.5L1.5 10.5M10.5 10.5L1.5 1.5");
	pathTag11.setAttribute("stroke", "#F10000");
	pathTag11.setAttribute("stroke-width", "1.56");
	pathTag11.setAttribute("stroke-linecap", "round");

	svgTag1.append(pathTag11);
	fileDiv.append(span, svgTag1);
	ele.innerHTML = "";
	ele.appendChild(fileDiv);
}

let profileUrl, QRByteCodeData, accessToken, googlePrivateKey, googleServiceAccount, googleIssuerID;
const generateBtn = document.getElementById("generate-card");
let date;
generateBtn.addEventListener("click", function (e) {
	e.preventDefault();
	showLoader();
	if (!isEditMode) {
		let config = {
			formName: "NFC",
			data: {
				data: formData,
				result: {
					message: true,
				},
			},
		};

		ZOHO.CREATOR.API.addRecord(config).then(async function (response) {
			if (response.code == 3000) {
				const responseMap = JSON.parse(response.message);
				QRByteCodeData = responseMap.QRByteCode;
				profileUrl = responseMap.redirectUrl;
				accessToken = responseMap.accessToken;
				googlePrivateKey = responseMap.privatekey;
				googleServiceAccount = responseMap.serviceaccount;
				googleIssuerID = responseMap.issuerid;

				let createdRecordID = response.data.ID;

				uploadVCFFile(createdRecordID);
				const uploadFileFunctions = [uploadLogo(createdRecordID)];
				// uploadProfileImage(createdRecordID),
				if (profilePic.files.length > 0) {
					uploadFileFunctions.push(uploadProfilePic(createdRecordID));
				}

				await Promise.all(uploadFileFunctions);
				// sendMail(createdRecordID);
				let uploadedData = await getUploadedRecord(createdRecordID);
				getGooglePassURL(uploadedData, createdRecordID, googlePrivateKey, googleServiceAccount, googleIssuerID);
			}
		});
	} else {
		let config = {
			reportName: "NFC_Report",
			id: editRecordId,
			data: {
				data: formData,
				result: {
					message: true,
				},
			},
		};

		ZOHO.CREATOR.API.updateRecord(config).then(async function (response) {
			const responseMap = JSON.parse(response.message);
			if (response.code == 3000) {
				QRByteCodeData = responseMap.QRByteCode;
				profileUrl = responseMap.redirectUrl;
				accessToken = responseMap.accessToken;
				googlePrivateKey = responseMap.privatekey;
				googleServiceAccount = responseMap.serviceaccount;
				googleIssuerID = responseMap.issuerid;

				let createdRecordID = response.data.ID;

				uploadVCFFile(createdRecordID);
				const uploadFileFunctions = [];
				// uploadProfileImage(createdRecordID),
				if (companyLogoTag.files.length > 0) {
					uploadFileFunctions.push(uploadLogo(createdRecordID));
				}
				if (profilePic.files.length > 0) {
					uploadFileFunctions.push(uploadProfilePic(createdRecordID));
				}

				await Promise.all(uploadFileFunctions);
				// sendMail(createdRecordID);
				let uploadedData = await getUploadedRecord(createdRecordID);
				getGooglePassURL(uploadedData, createdRecordID, googlePrivateKey, googleServiceAccount, googleIssuerID);
			}
		});
	}
});

function getUploadedRecord(createdRecordID) {
	try {
		let config = {
			reportName: "NFC_Report",
			id: createdRecordID,
		};

		return ZOHO.CREATOR.API.getRecordById(config).then(function (response) {
			return response.data;
		});
	} catch (error) {
		return false;
	}
}

function uploadLogo(createdRecordID) {
	let fileObject = companyLogoTag.files[0];
	let config = {
		reportName: "NFC_Report",
		id: createdRecordID,
		fieldName: "Logo",
		file: fileObject,
	};

	return ZOHO.CREATOR.API.uploadFile(config);
}

async function uploadVCFFile(createdRecordID) {
	const nfcData = formData;
	if (profilePic.files.length > 0) {
		nfcData.base64Image = await blobToBase64(profilePic.files[0]);
	}

	const vcardBlob = await generateVCardBlob(nfcData);
	const vcardFile = new File([vcardBlob], `${nfcData.Name}.vcf`, { type: "text/vcard" });

	let config = {
		reportName: "NFC_Report",
		id: createdRecordID,
		fieldName: "V_Card",
		file: vcardFile,
	};

	return ZOHO.CREATOR.API.uploadFile(config);
}

async function getGooglePassURL(responseData, createdRecordID, googlePrivateKey, googleServiceAccount, googleIssuerID) {
	let googlePassData = formData;
	if (profilePic.files.length > 0) {
		googlePassData.profileBase64Image = responseData["Profile_Public_Link"];
	} else if (isEditMode) {
		googlePassData.profileBase64Image = responseData["Profile_Public_Link"];
	}
	googlePassData.logoBase64Image = responseData["Logo_Public_Link"];
	googlePassData.qrURL = responseData["Contact_Download_Link"];

	let googlePassURL = await initiateGooglePassCreation(
		googlePassData,
		createdRecordID,
		getThemeColor(),
		accessToken,
		googlePrivateKey,
		googleServiceAccount,
		googleIssuerID,
	);
	sendMail(createdRecordID, googlePassURL);
}

const screenshotTemplate = document.getElementById("screen-shot");

async function uploadProfileImage(createdRecordID) {
	const tempDiv = screenshotTemplate.content.cloneNode(true);
	tempDiv.getElementById("profile-name").innerText = nameTag.value;
	tempDiv.getElementById("profile-role").innerText = roleTag.value;
	tempDiv.getElementById("qr-img").src = QRByteCodeData;
	tempDiv.getElementById("user-mobile").innerText = `${currentCountry.innerText.trim()} ${numberTag.value.trim()}`;
	tempDiv.getElementById("user-mail").innerText = emailTag.value;

	const profileFile = profilePic.files[0];
	const logoFile = companyLogoTag.files[0];

	const profileImgTag = tempDiv.getElementById("profile-user-img");
	const logoImgTag = tempDiv.getElementById("logo-user-img");

	try {
		document.body.appendChild(tempDiv);

		await Promise.all([loadImage(profileFile, profileImgTag), loadImage(logoFile, logoImgTag)]);

		const targetElement = document.body.lastElementChild;
		return new Promise((resolve, reject) => {
			html2canvas(targetElement, { useCORS: true })
				.then((canvas) => {
					canvas.toBlob((blob) => {
						if (blob) {
							let fileObject = new File([blob], `${nameTag.value}_QR.png`, { type: "image/png" });

							let config = {
								reportName: "NFC_Report",
								id: createdRecordID,
								fieldName: "Profile",
								file: fileObject,
							};

							ZOHO.CREATOR.API.uploadFile(config)
								.then(() => {
									resolve([]);
								})
								.catch(reject);
						} else {
							reject("Blob conversion failed");
						}
					}, "image/png");
				})
				.catch(reject);
		});
	} catch (error) {
		console.error("Error loading images:", error);
	}
}

function loadImage(file, imgElement) {
	return new Promise((resolve, reject) => {
		if (!file) {
			imgElement.src = "./assets/user-new.svg";
			return resolve(null);
		}

		const reader = new FileReader();
		reader.onload = function (event) {
			imgElement.src = event.target.result;
			imgElement.onload = () => resolve();
			imgElement.onerror = reject;
		};
		reader.readAsDataURL(file);
	});
}

function sendMail(createdRecordID, googlePassURL) {
	var config = {
		reportName: "NFC_Report",
		id: createdRecordID,
		data: {
			data: {
				Google_Pass_Url: {
					value: "Google Pass",
					url: googlePassURL,
					title: "Google Pass",
				},
			},
		},
	};

	ZOHO.CREATOR.API.updateRecord(config).then(function (response) {
		if (response.code == 3000) {
			generateFinalisedScreen();
		}
	});
}

async function generateVCardBlob(nfcData) {
	let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
	vcard += `N:;${nfcData.Name};;;\n`;
	vcard += `FN:${nfcData.Name}\n`;
	vcard += `TEL;type=WORK;type=VOICE;type=pref:${nfcData.Phone_Number}\n`;
	vcard += `EMAIL;type=INTERNET;type=WORK;type=pref:${nfcData.Email_Address}\n`;
	vcard += `ORG:${nfcData.Company_Name}\n`;
	vcard += `TITLE:${nfcData.Role}\n`;

	if (nfcData.Website.url != "") {
		vcard += `URL;TYPE=WORK;type=pref:${nfcData.Website.url}\n`;
	}
	if (nfcData.Facebook.url != "") {
		vcard += `X-SOCIALPROFILE;type=facebook:${nfcData.Facebook.url}\n`;
	}
	if (nfcData.LinkedIn.url != "") {
		vcard += `X-SOCIALPROFILE;type=linkedin:${nfcData.LinkedIn.url}\n`;
	}
	if (nfcData.X.url != "") {
		vcard += `X-SOCIALPROFILE;type=twitter:${nfcData.X.url}\n`;
	}
	if (nfcData.Whatsapp.url != "") {
		vcard += `X-SOCIALPROFILE;type=WhatsApp:${nfcData.Whatsapp.url}\n`;
	}
	if (nfcData.Instagram.url != "") {
		vcard += `X-SOCIALPROFILE;type=Instagram:${nfcData.Instagram.url}\n`;
	}
	if (nfcData.base64Image) {
		vcard += `PHOTO;ENCODING=BASE64;TYPE=JPEG:${nfcData.base64Image}\n`;
	}
	vcard += `NOTE:${nfcData.About}\n`;
	if (
		addressLine1.value.trim() != "" ||
		addressLine2.value.trim() != "" ||
		city.value.trim() != "" ||
		state.value.trim() != "" ||
		postalcode.value.trim() != "" ||
		!country.className.includes("default")
	) {
		vcard += `ADR;HOME:;;${addressLine1.value.trim()}\\n${addressLine2.value.trim()};${city.value.trim()};${state.value.trim()} ;${postalcode.value.trim()};${
			!country.className.includes("default") ? country.innerText : ""
		}\n`;
	}
	vcard += "END:VCARD";

	return new Blob([vcard], { type: "text/vcard" });
}

function blobToBase64(blob) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result.split(",")[1]);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
}

function uploadProfilePic(createdRecordID) {
	let fileObject = profilePic.files[0];
	let config = {
		reportName: "NFC_Report",
		id: createdRecordID,
		fieldName: "Image",
		file: fileObject,
	};

	return ZOHO.CREATOR.API.uploadFile(config);
}

const template = document.getElementById("final-scrn-template");
function generateFinalisedScreen() {
	const clone = template.content.cloneNode(true);
	clone.getElementById("go-to-home").addEventListener("click", function () {
		showLoader();
		if (!isEditMode) location.reload();
		else {
			var param = {
				action: "open",
				url: "#Page:My_VirtuCards1",
				window: "same",
			};
			ZOHO.CREATOR.UTIL.navigateParentURL(param);
		}
	});

	clone.getElementById("view-card").addEventListener("click", function () {
		var param = {
			action: "open",
			url: profileUrl,
			window: "same",
		};
		ZOHO.CREATOR.UTIL.navigateParentURL(param);
	});
	hideLoader();
	document.body.appendChild(clone);
}

const loader = document.getElementById("loader");
function hideLoader() {
	loader.classList.add("hide-loader");
}

function showLoader() {
	loader.classList.remove("hide-loader");
}
