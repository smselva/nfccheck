let privateKeyPem, serviceAccount, issuerID, classID;

const baseUrl = "https://walletobjects.googleapis.com/walletobjects/v1/genericObject";

async function updateObject(baseUrl, accessToken, newObject) {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await fetch(baseUrl, {
				method: "PUT",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newObject),
			});

			if (!response.ok) {
				const error = await response.json();
				reject(error);
			}

			const data = await response.json();
			const genericObject = data;
			const claims = {
				iss: serviceAccount,
				aud: "google",
				origins: [],
				typ: "savetowallet",
				payload: {
					genericObjects: [genericObject],
				},
			};
			const passJson = await insertJwt(claims, accessToken, privateKeyPem);
			const passUrl = passJson.saveUri;
			resolve(passUrl);
		} catch (err) {
			console.error("Error creating object:", err);
			reject(err);
		}
	});
}

async function createObject(accessToken, newObject) {
	return new Promise(async (resolve, reject) => {
		try {
			const response = await fetch(baseUrl, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(newObject),
			});

			if (!response.ok) {
				const error = await response.json();
				reject(error);
			}

			const data = await response.json();
			const genericObject = data;
			const claims = {
				iss: serviceAccount,
				aud: "google",
				origins: [],
				typ: "savetowallet",
				payload: {
					genericObjects: [genericObject],
				},
			};
			const passJson = await insertJwt(claims, accessToken, privateKeyPem);
			const passUrl = passJson.saveUri;
			resolve(passUrl);
		} catch (err) {
			console.error("Error creating object:", err);
			reject(err);
		}
	});
}

async function insertJwt(claims, accessToken, privateKeyPem) {
	return new Promise(async (resolve, reject) => {
		const url = "https://walletobjects.googleapis.com/walletobjects/v1/jwt";
		const header = {
			alg: "RS256",
			typ: "JWT",
		};

		let claimsJwt = await createJWT(header, claims, privateKeyPem);

		try {
			const response = await fetch(url, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					jwt: claimsJwt,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				reject(error.error.message);
			}

			const data = await response.json();
			resolve(data);
		} catch (err) {
			console.error("Error during JWT insert:", err);
			reject(err);
		}
	});
}

async function createJWT(header, payload, privateKeyPem) {
	const encodedHeader = base64UrlEncode(JSON.stringify(header));
	const encodedPayload = base64UrlEncode(JSON.stringify(payload));
	const signingInput = `${encodedHeader}.${encodedPayload}`;
	const privateKey = await importPrivateKey(privateKeyPem);
	const signature = await signRS256(privateKey, signingInput);
	return `${signingInput}.${signature}`;
}

function base64UrlEncode(input) {
	console.log(input);
	return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function importPrivateKey(pemKey) {
	const key = pemKey
		.replace(/-----BEGIN PRIVATE KEY-----/, "")
		.replace(/-----END PRIVATE KEY-----/, "")
		.replace(/\s+/g, "");

	const binaryKey = atob(key);
	const keyBuffer = new Uint8Array(binaryKey.length);

	for (let i = 0; i < binaryKey.length; i++) {
		keyBuffer[i] = binaryKey.charCodeAt(i);
	}

	return crypto.subtle.importKey("pkcs8", keyBuffer.buffer, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
}

function stringToArrayBuffer(input) {
	return new TextEncoder().encode(input);
}

async function signRS256(privateKey, data) {
	const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", privateKey, stringToArrayBuffer(data));

	const signatureBytes = new Uint8Array(signature);
	let binary = "";
	for (let byte of signatureBytes) {
		binary += String.fromCharCode(byte);
	}
	return base64UrlEncode(binary);
}

export function initiateGooglePassCreation(
	dataObject,
	createdRecordID,
	themeColor,
	accessToken,
	googlePrivateKey,
	googleServiceAccount,
	googleIssuerID,
) {
	return new Promise(async (resolve, reject) => {
		privateKeyPem = googlePrivateKey;
		serviceAccount = googleServiceAccount;
		issuerID = googleIssuerID;
		classID = `${issuerID}.ZOHO_Generic_Pass`;
		let objectId = `${issuerID}.${createdRecordID}`;

		const textModulesData = [
			{
				id: "title",
				header: "Title",
				body: dataObject["Role"],
			},
			{
				id: "company",
				header: "Company",
				body: dataObject["Company_Name"],
			},
			{
				id: "email",
				header: "Email",
				body: dataObject["Email_Address"],
			},
			{
				id: "phone",
				header: "Phone",
				body: dataObject["Phone_Number"],
			},
		];

		const addressFields = [
			dataObject["Address"]["address_line_1"].trim(),
			dataObject["Address"]["address_line_2"].trim(),
			dataObject["Address"]["district_city"].trim(),
			dataObject["Address"]["state_province"].trim(),
			dataObject["Address"]["postal_Code"].trim(),
			dataObject["Address"]["country"].trim(),
		].filter((val) => val);

		if (addressFields.length > 0) {
			textModulesData.push({
				id: "address",
				header: "Address",
				body: addressFields.join(", "),
			});
		}

		textModulesData.push({
			id: "about",
			header: "About",
			body: dataObject["About"],
		});

		const linksModuleData = {
			uris: [],
		};

		if (dataObject.Website.url.trim() !== "") {
			linksModuleData.uris.push({
				uri: dataObject.Website.url,
				description: "Website",
				id: "website",
			});
		}

		if (dataObject.Facebook.url.trim() !== "") {
			linksModuleData.uris.push({
				uri: dataObject.Facebook.url,
				description: "Facebook",
				id: "facebook",
			});
		}

		if (dataObject.LinkedIn.url.trim() !== "") {
			linksModuleData.uris.push({
				uri: dataObject.LinkedIn.url,
				description: "LinkedIn",
				id: "linkedin",
			});
		}

		if (dataObject.X.url.trim() !== "") {
			linksModuleData.uris.push({
				uri: dataObject.X.url,
				description: "Twitter",
				id: "twitter",
			});
		}

		if (dataObject.Whatsapp.url.trim() !== "") {
			linksModuleData.uris.push({
				uri: dataObject.Whatsapp.url,
				description: "WhatsApp",
				id: "whatsapp",
			});
		}

		if (dataObject.Instagram.url.trim() !== "") {
			linksModuleData.uris.push({
				uri: dataObject.Instagram.url,
				description: "Instagram",
				id: "instagram",
			});
		}

		const newObject = {
			id: `${objectId}`,
			classId: `${classID}`,
			state: "ACTIVE",

			logo: {
				sourceUri: {
					uri: dataObject["logoBase64Image"],
				},
				contentDescription: {
					defaultValue: {
						language: "en-US",
						value: "Company Logo",
					},
				},
			},

			cardTitle: {
				defaultValue: {
					language: "en-US",
					value: dataObject["Company_Name"],
				},
			},

			subheader: {
				defaultValue: {
					language: "en-US",
					value: "Name",
				},
			},

			header: {
				defaultValue: {
					language: "en-US",
					value: dataObject["Name"],
				},
			},

			textModulesData,

			barcode: {
				type: "QR_CODE",
				value: dataObject["qrURL"],
				alternateText: "Scan to preview profile",
			},

			linksModuleData: linksModuleData,
			hexBackgroundColor: themeColor,
		};

		if (dataObject["profileBase64Image"]) {
			newObject.heroImage = {
				sourceUri: {
					uri: dataObject["profileBase64Image"],
				},
				contentDescription: {
					defaultValue: {
						language: "en-US",
						value: "Profile Picture",
					},
				},
			};
		}

		let response = await fetch(`${baseUrl}/${objectId}`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			let returnResp = createObject(accessToken, newObject);
			resolve(returnResp);
		} else {
			let returnResp = updateObject(`${baseUrl}/${objectId}`, accessToken, newObject);
			resolve(returnResp);
		}
	});
}
