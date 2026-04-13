import { getCompanyLogo } from "./nfcform.js";

export function getCard(cardId, front_back, data) {
	if (cardId == 1 && front_back == "front") {
		return getFirstCardFront(data);
	} else if (cardId == 1 && front_back == "back") {
		return getFirstCardBack(data);
	}
}

const nfcLogoSVG =
	'<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.31034 8.10254L11.3103 16.1025M18.0323 20.6025C19.5244 18.0182 20.3099 15.0867 20.3099 12.1025C20.3099 9.11842 19.5244 6.18687 18.0323 3.60254M14.7023 18.1025C15.7556 16.2783 16.31 14.209 16.31 12.1025C16.31 9.9961 15.7556 7.92677 14.7023 6.10254M11.2383 16.1025C11.9405 14.8864 12.3101 13.5068 12.3101 12.1025C12.3101 10.6982 11.9405 9.31869 11.2383 8.10254M6.38234 16.1025C5.6802 14.8864 5.31055 13.5068 5.31055 12.1025C5.31055 10.6982 5.6802 9.31869 6.38234 8.10254" stroke="white" stroke-linecap="round"/></svg>';
function getFirstCardFront(data) {
	const frontCardWrapper = document.createElement("div");
	frontCardWrapper.className = "front-wrapper first-card";
	const nfcLogo = document.createElement("div");
	nfcLogo.innerHTML = nfcLogoSVG;
	nfcLogo.className = "nfc-logo";

	const cardName = document.createElement("div");
	cardName.innerHTML = data.Name;
	cardName.className = "card-name";

	const companyLogo = document.createElement("img");
	companyLogo.className = "company-logo";
	const companyLogoTag = getCompanyLogo();
	if (companyLogoTag) {
		const imageURL = URL.createObjectURL(companyLogoTag);
		companyLogo.src = imageURL;
		companyLogo.onload = () => {
			URL.revokeObjectURL(imageURL);
		};
	}

	frontCardWrapper.append(nfcLogo, cardName, companyLogo);

	return frontCardWrapper;
}

function getFirstCardBack(data) {
	const backCardWrapper = document.createElement("div");
	backCardWrapper.className = "back-wrapper first-card";

	const nfcLogo = document.createElement("div");
	nfcLogo.innerHTML = nfcLogoSVG;
	nfcLogo.className = "nfc-logo";

	const companyLogo = document.createElement("img");
	companyLogo.className = "company-logo";
	const companyLogoTag = getCompanyLogo();
	if (companyLogoTag) {
		const imageURL = URL.createObjectURL(companyLogoTag);
		companyLogo.src = imageURL;
		companyLogo.onload = () => {
			URL.revokeObjectURL(imageURL);
		};
	}

	const infoWrapperDiv = document.createElement("div");
	infoWrapperDiv.className = "contact-info-wrapper";

	const cardContactInfo = document.createElement("div");
	cardContactInfo.className = "card-contact-info";
	const contactMobile = document.createElement("div");
	contactMobile.innerText = data.Phone_Number;
	contactMobile.className = "card-mobile-no";

	const contactEmail = document.createElement("div");
	contactEmail.innerText = data.Email_Address;
	contactEmail.className = "card-email";

	const contactRole = document.createElement("div");
	contactRole.innerText = data.Role;
	contactRole.className = "card-role";
	cardContactInfo.append(contactMobile, contactEmail, contactRole);

	const qrImageWrapper = document.createElement("div");
	qrImageWrapper.className = "qr-image-wrapper";
	const qrImage = document.createElement("img");
	qrImage.src = "./assets/qr.png";
	qrImage.className = "card-qr-image";
	qrImageWrapper.appendChild(qrImage);

	infoWrapperDiv.append(cardContactInfo, qrImageWrapper);

	backCardWrapper.append(nfcLogo, companyLogo, infoWrapperDiv);
	return backCardWrapper;
}
