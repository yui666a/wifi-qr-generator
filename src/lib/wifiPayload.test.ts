import { describe, expect, it } from "vitest";
import { buildWifiPayload } from "./wifiPayload";

describe("buildWifiPayload", () => {
	it("WPA のネットワークを T/S/P/H の順で組み立てる", () => {
		const payload = buildWifiPayload({
			ssid: "MyHomeWiFi",
			password: "p@ssw0rd123",
			encryption: "WPA",
			hidden: false,
		});

		expect(payload).toBe("WIFI:T:WPA;S:MyHomeWiFi;P:p@ssw0rd123;H:false;;");
	});

	it("WEP のネットワークを組み立てる", () => {
		const payload = buildWifiPayload({
			ssid: "OldRouter",
			password: "wepkey123",
			encryption: "WEP",
			hidden: false,
		});

		expect(payload).toBe("WIFI:T:WEP;S:OldRouter;P:wepkey123;H:false;;");
	});

	it("暗号化なしのときはパスワードを出力しない", () => {
		const payload = buildWifiPayload({
			ssid: "FreeSpot",
			password: "ignored",
			encryption: "nopass",
			hidden: false,
		});

		expect(payload).toBe("WIFI:T:nopass;S:FreeSpot;H:false;;");
	});

	it("ステルスSSIDのときは H:true を出力する", () => {
		const payload = buildWifiPayload({
			ssid: "Hidden",
			password: "secret",
			encryption: "WPA",
			hidden: true,
		});

		expect(payload).toBe("WIFI:T:WPA;S:Hidden;P:secret;H:true;;");
	});

	describe("特殊文字のエスケープ", () => {
		it.each([
			["セミコロン", "a;b", "a\\;b"],
			["カンマ", "a,b", "a\\,b"],
			["コロン", "a:b", "a\\:b"],
			["バックスラッシュ", "a\\b", "a\\\\b"],
			["ダブルクォート", 'a"b', 'a\\"b'],
		])("SSID の %s をエスケープする", (_label, raw, escaped) => {
			const payload = buildWifiPayload({
				ssid: raw,
				password: "pass",
				encryption: "WPA",
				hidden: false,
			});

			expect(payload).toBe(`WIFI:T:WPA;S:${escaped};P:pass;H:false;;`);
		});

		it.each([
			["セミコロン", "a;b", "a\\;b"],
			["カンマ", "a,b", "a\\,b"],
			["コロン", "a:b", "a\\:b"],
			["バックスラッシュ", "a\\b", "a\\\\b"],
			["ダブルクォート", 'a"b', 'a\\"b'],
		])("パスワードの %s をエスケープする", (_label, raw, escaped) => {
			const payload = buildWifiPayload({
				ssid: "Net",
				password: raw,
				encryption: "WPA",
				hidden: false,
			});

			expect(payload).toBe(`WIFI:T:WPA;S:Net;P:${escaped};H:false;;`);
		});

		it("複数の特殊文字を同時にエスケープする", () => {
			const payload = buildWifiPayload({
				ssid: "Net",
				password: 'a;b,c:d\\e"f',
				encryption: "WPA",
				hidden: false,
			});

			expect(payload).toBe('WIFI:T:WPA;S:Net;P:a\\;b\\,c\\:d\\\\e\\"f;H:false;;');
		});
	});

	describe("16進数と解釈されうる値のクォート", () => {
		it("16進数だけの SSID をダブルクォートで囲む", () => {
			const payload = buildWifiPayload({
				ssid: "1234ABCD",
				password: "pass",
				encryption: "WPA",
				hidden: false,
			});

			expect(payload).toBe('WIFI:T:WPA;S:"1234ABCD";P:pass;H:false;;');
		});

		it("16進数だけのパスワードをダブルクォートで囲む", () => {
			const payload = buildWifiPayload({
				ssid: "Net",
				password: "DEADBEEF",
				encryption: "WPA",
				hidden: false,
			});

			expect(payload).toBe('WIFI:T:WPA;S:Net;P:"DEADBEEF";H:false;;');
		});

		it("数字だけのパスワードも16進数として読めるため囲む", () => {
			const payload = buildWifiPayload({
				ssid: "Net",
				password: "12345678",
				encryption: "WPA",
				hidden: false,
			});

			expect(payload).toBe('WIFI:T:WPA;S:Net;P:"12345678";H:false;;');
		});

		it("16進数以外の文字を含むなら囲まない", () => {
			const payload = buildWifiPayload({
				ssid: "1234ABCG",
				password: "pass",
				encryption: "WPA",
				hidden: false,
			});

			expect(payload).toBe("WIFI:T:WPA;S:1234ABCG;P:pass;H:false;;");
		});

		it("小文字の16進数だけの SSID も囲む", () => {
			const payload = buildWifiPayload({
				ssid: "abcdef01",
				password: "pass",
				encryption: "WPA",
				hidden: false,
			});

			expect(payload).toBe('WIFI:T:WPA;S:"abcdef01";P:pass;H:false;;');
		});
	});

	describe("入力の検証", () => {
		it("SSID が空のときはエラーを投げる", () => {
			expect(() =>
				buildWifiPayload({ ssid: "", password: "pass", encryption: "WPA", hidden: false }),
			).toThrow("SSID は必須です");
		});

		it("SSID が空白のみのときはエラーを投げる", () => {
			expect(() =>
				buildWifiPayload({ ssid: "   ", password: "pass", encryption: "WPA", hidden: false }),
			).toThrow("SSID は必須です");
		});

		it("暗号化ありでパスワードが空のときはエラーを投げる", () => {
			expect(() =>
				buildWifiPayload({ ssid: "Net", password: "", encryption: "WPA", hidden: false }),
			).toThrow("パスワードは必須です");
		});

		it("暗号化なしならパスワードが空でも通る", () => {
			expect(() =>
				buildWifiPayload({ ssid: "Net", password: "", encryption: "nopass", hidden: false }),
			).not.toThrow();
		});
	});
});
