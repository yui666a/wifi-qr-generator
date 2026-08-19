import { describe, expect, it } from "vitest";
import { parseWifiCsv } from "./parseWifiCsv";

describe("parseWifiCsv", () => {
	describe("基本の解釈", () => {
		it("ヘッダ行に続く各行をネットワークとして読む", () => {
			const result = parseWifiCsv("ssid,password\nMyWiFi,secret123\nOther,pass456");

			expect(result.entries).toEqual([
				{ ssid: "MyWiFi", password: "secret123", label: "", encryption: "WPA", hidden: false },
				{ ssid: "Other", password: "pass456", label: "", encryption: "WPA", hidden: false },
			]);
			expect(result.errors).toEqual([]);
		});

		it("列の順序が入れ替わっていても列名で対応づける", () => {
			const result = parseWifiCsv("password,ssid\nsecret123,MyWiFi");

			expect(result.entries[0]).toMatchObject({ ssid: "MyWiFi", password: "secret123" });
		});

		it("label 列をカードの見出しとして読む", () => {
			const result = parseWifiCsv("ssid,password,label\n1F-1_5G,KG4vNI95,1階");

			expect(result.entries[0]).toMatchObject({ ssid: "1F-1_5G", label: "1階" });
		});

		it("encryption 列を暗号化方式として読む", () => {
			const result = parseWifiCsv("ssid,password,encryption\nFreeSpot,,nopass");

			expect(result.entries[0]).toMatchObject({ ssid: "FreeSpot", encryption: "nopass" });
		});

		it("タブ区切りも読む", () => {
			const result = parseWifiCsv("ssid\tpassword\nMyWiFi\tsecret123");

			expect(result.entries[0]).toMatchObject({ ssid: "MyWiFi", password: "secret123" });
		});
	});

	describe("列名の表記ゆれ", () => {
		it.each([
			["大文字", "SSID,PASSWORD"],
			["前後の空白", " ssid , password "],
			["日本語", "ネットワーク名,パスワード"],
		])("%s の列名を認識する", (_label, header) => {
			const result = parseWifiCsv(`${header}\nMyWiFi,secret123`);

			expect(result.entries[0]).toMatchObject({ ssid: "MyWiFi", password: "secret123" });
		});
	});

	describe("既定値", () => {
		it("label 列が無いときは空にする", () => {
			const result = parseWifiCsv("ssid,password\nMyWiFi,secret123");

			expect(result.entries[0]?.label).toBe("");
		});

		it("encryption 列が無いときは WPA にする", () => {
			const result = parseWifiCsv("ssid,password\nMyWiFi,secret123");

			expect(result.entries[0]?.encryption).toBe("WPA");
		});

		it("encryption が空欄のときは WPA にする", () => {
			const result = parseWifiCsv("ssid,password,encryption\nMyWiFi,secret123,");

			expect(result.entries[0]?.encryption).toBe("WPA");
		});
	});

	describe("値の解釈", () => {
		it("引用符で囲まれた値の中の区切り文字を保つ", () => {
			const result = parseWifiCsv('ssid,password\n"Cafe,Wi-Fi",secret123');

			expect(result.entries[0]?.ssid).toBe("Cafe,Wi-Fi");
		});

		it("引用符の中の二重引用符を 1 つに戻す", () => {
			const result = parseWifiCsv('ssid,password\n"He said ""hi""",secret123');

			expect(result.entries[0]?.ssid).toBe('He said "hi"');
		});

		it("値の前後の空白を落とす", () => {
			const result = parseWifiCsv("ssid,password\n  MyWiFi  ,  secret123  ");

			expect(result.entries[0]).toMatchObject({ ssid: "MyWiFi", password: "secret123" });
		});

		it("空行を読み飛ばす", () => {
			const result = parseWifiCsv("ssid,password\nMyWiFi,secret123\n\n\nOther,pass456");

			expect(result.entries).toHaveLength(2);
		});

		it("CRLF 改行を読む", () => {
			const result = parseWifiCsv("ssid,password\r\nMyWiFi,secret123");

			expect(result.entries[0]?.ssid).toBe("MyWiFi");
		});
	});

	describe("不正な入力", () => {
		it("SSID が空の行はエラーにして取り込まない", () => {
			const result = parseWifiCsv("ssid,password\n,secret123\nOther,pass456");

			expect(result.entries).toHaveLength(1);
			expect(result.errors).toEqual([{ line: 2, message: "SSID がありません" }]);
		});

		it("暗号化ありでパスワードが空の行はエラーにする", () => {
			const result = parseWifiCsv("ssid,password\nMyWiFi,");

			expect(result.entries).toHaveLength(0);
			expect(result.errors).toEqual([{ line: 2, message: "パスワードがありません" }]);
		});

		it("暗号化なしならパスワードが空でも取り込む", () => {
			const result = parseWifiCsv("ssid,password,encryption\nFreeSpot,,nopass");

			expect(result.entries).toHaveLength(1);
			expect(result.errors).toEqual([]);
		});

		it("知らない暗号化方式はエラーにする", () => {
			const result = parseWifiCsv("ssid,password,encryption\nMyWiFi,secret,WPA4");

			expect(result.errors).toEqual([{ line: 2, message: "暗号化方式が不正です: WPA4" }]);
		});

		it("ssid 列が無いヘッダはエラーにする", () => {
			const result = parseWifiCsv("name,password\nMyWiFi,secret123");

			expect(result.entries).toHaveLength(0);
			expect(result.errors).toEqual([{ line: 1, message: "ssid 列が見つかりません" }]);
		});

		it("空の入力はエラーも結果も返さない", () => {
			const result = parseWifiCsv("   \n  ");

			expect(result.entries).toHaveLength(0);
			expect(result.errors).toHaveLength(0);
		});

		it("ヘッダ行だけなら結果は空", () => {
			const result = parseWifiCsv("ssid,password");

			expect(result.entries).toHaveLength(0);
			expect(result.errors).toHaveLength(0);
		});
	});

	describe("実際に渡されたリストを CSV にした場合", () => {
		const csv = [
			"ssid,password,label",
			"regate_kaigi,regate2023!,地下",
			"regate_B1F,kcBU1Nru,地下",
			"1F-1_5G,KG4vNI95,1階",
			"3F1_2.4G,72897823,3階",
			"5F-2_2G,9WwLtt4Q,5階",
		].join("\n");

		it("全行を取り込む", () => {
			const result = parseWifiCsv(csv);

			expect(result.entries).toHaveLength(5);
			expect(result.errors).toEqual([]);
		});

		it("数字だけのパスワードも文字列として保つ", () => {
			const result = parseWifiCsv(csv);

			expect(result.entries[3]).toMatchObject({ ssid: "3F1_2.4G", password: "72897823" });
		});

		it("記号を含むパスワードをそのまま保つ", () => {
			const result = parseWifiCsv(csv);

			expect(result.entries[0]?.password).toBe("regate2023!");
		});
	});
});
