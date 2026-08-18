export type Encryption = "WPA" | "WEP" | "nopass";

export type WifiConfig = {
	ssid: string;
	password: string;
	encryption: Encryption;
	hidden: boolean;
};

// ZXing の Barcode Contents 仕様に従い、\ ; , " : の5文字をバックスラッシュで
// エスケープする。https://github.com/zxing/zxing/wiki/Barcode-Contents
const SPECIAL_CHARS = /([\\;,":])/g;

const HEX_ONLY = /^[0-9a-fA-F]+$/;

function escapeValue(value: string): string {
	return value.replace(SPECIAL_CHARS, "\\$1");
}

// 16進数としても読める値はリーダーがバイト列と誤認するため、仕様どおり
// ダブルクォートで囲んで ASCII 文字列であることを明示する
function quoteIfHex(value: string): string {
	return HEX_ONLY.test(value) ? `"${value}"` : value;
}

function encodeField(value: string): string {
	return quoteIfHex(escapeValue(value));
}

export function buildWifiPayload({ ssid, password, encryption, hidden }: WifiConfig): string {
	if (ssid.trim() === "") {
		throw new Error("SSID は必須です");
	}
	if (encryption !== "nopass" && password === "") {
		throw new Error("パスワードは必須です");
	}

	const fields = [`T:${encryption}`, `S:${encodeField(ssid)}`];
	if (encryption !== "nopass") {
		fields.push(`P:${encodeField(password)}`);
	}
	fields.push(`H:${hidden}`);

	return `WIFI:${fields.join(";")};;`;
}
