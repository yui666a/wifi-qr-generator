import jsQR from "jsqr";
import { PNG } from "pngjs";
import QRCode from "qrcode";
import { describe, expect, it } from "vitest";
import { buildWifiPayload, type WifiConfig } from "./wifiPayload";

// 中央にロゴを重ねると、その分のセルが失われる。誤り訂正で復元できる範囲に
// 収まっているかは実際にデコードしないと分からないため、ロゴを白で塗り潰した
// 画像を作って読み取れることを確かめる。
// qr.ts と同じ値を使う（ここがズレると検証の意味が無くなる）
const ERROR_CORRECTION_LEVEL = "H";
const LOGO_RATIO = 0.2;
const LOGO_PADDING_RATIO = 0.12;

async function decodeWithLogoMask(payload: string): Promise<string | null> {
	const size = 512;
	const buffer = await QRCode.toBuffer(payload, {
		errorCorrectionLevel: ERROR_CORRECTION_LEVEL,
		margin: 2,
		width: size,
	});
	const png = PNG.sync.read(buffer);

	// ロゴと白地が覆う正方形を、実際の描画と同じ比率で白く塗る
	const plateSize = size * LOGO_RATIO * (1 + LOGO_PADDING_RATIO * 2);
	const start = Math.floor((size - plateSize) / 2);
	const end = Math.ceil(start + plateSize);
	for (let y = start; y < end; y++) {
		for (let x = start; x < end; x++) {
			const index = (png.width * y + x) << 2;
			png.data[index] = 255;
			png.data[index + 1] = 255;
			png.data[index + 2] = 255;
			png.data[index + 3] = 255;
		}
	}

	return jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data ?? null;
}

describe("ロゴを重ねた QR コードの読み取り", () => {
	const cases: [string, WifiConfig][] = [
		[
			"通常のネットワーク",
			{ ssid: "MyHomeWiFi", password: "p@ssw0rd123", encryption: "WPA", hidden: false },
		],
		[
			"特殊文字を含む",
			{ ssid: "Cafe;Wi-Fi", password: 'a:b\\c"d,e', encryption: "WPA", hidden: false },
		],
		["暗号化なし", { ssid: "FreeSpot", password: "", encryption: "nopass", hidden: false }],
		[
			"日本語 SSID",
			{ ssid: "自宅のWiFi", password: "パスワード", encryption: "WPA", hidden: false },
		],
		[
			"長いパスワード",
			{
				ssid: "OfficeNetwork2026",
				password: "aVeryLongPassphraseForTesting1234567890",
				encryption: "WPA",
				hidden: false,
			},
		],
	];

	it.each(cases)("%s はロゴで隠れても読み取れる", async (_label, config) => {
		const payload = buildWifiPayload(config);

		await expect(decodeWithLogoMask(payload)).resolves.toBe(payload);
	});
});
