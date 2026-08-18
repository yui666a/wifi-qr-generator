import jsQR from "jsqr";
import { PNG } from "pngjs";
import QRCode from "qrcode";
import { describe, expect, it } from "vitest";
import { buildWifiPayload, type WifiConfig } from "./wifiPayload";

// 生成した QR がリーダーで実際に読み取れ、元のペイロードに戻ることを確かめる。
// buildWifiPayload の単体テストは文字列の組み立てまでしか保証しないため、
// 画像として往復できるかはここで押さえる。
async function decode(payload: string): Promise<string | null> {
	const buffer = await QRCode.toBuffer(payload, {
		errorCorrectionLevel: "M",
		margin: 2,
		width: 512,
	});
	const png = PNG.sync.read(buffer);
	const result = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
	return result?.data ?? null;
}

describe("生成した QR コードの読み取り", () => {
	const cases: [string, WifiConfig][] = [
		[
			"通常のネットワーク",
			{ ssid: "MyHomeWiFi", password: "p@ssw0rd123", encryption: "WPA", hidden: false },
		],
		[
			"特殊文字を含む",
			{ ssid: "Cafe;Wi-Fi", password: 'a:b\\c"d,e', encryption: "WPA", hidden: false },
		],
		["16進数の SSID", { ssid: "1234ABCD", password: "pass", encryption: "WPA", hidden: false }],
		["暗号化なし", { ssid: "FreeSpot", password: "", encryption: "nopass", hidden: false }],
		["ステルス", { ssid: "Hidden", password: "secret", encryption: "WPA", hidden: true }],
		[
			"日本語 SSID",
			{ ssid: "自宅のWiFi", password: "パスワード", encryption: "WPA", hidden: false },
		],
	];

	it.each(cases)("%s のペイロードが往復する", async (_label, config) => {
		const payload = buildWifiPayload(config);

		await expect(decode(payload)).resolves.toBe(payload);
	});
});
