import type { Encryption } from "./wifiPayload";

export type WifiEntry = {
	ssid: string;
	password: string;
	label: string;
	encryption: Encryption;
	hidden: boolean;
};

export type ParseError = {
	line: number;
	message: string;
};

export type ParseResult = {
	entries: WifiEntry[];
	errors: ParseError[];
};

const ENCRYPTIONS: Encryption[] = ["WPA", "WEP", "nopass"];

// 貼り付け元によって列名の表記は揺れる。日本語の見出しをそのまま貼られても
// 読めるようにしておく
const COLUMN_ALIASES: Record<keyof Omit<WifiEntry, "hidden">, string[]> = {
	ssid: ["ssid", "networkname", "network", "ネットワーク名", "ネットワーク", "名前"],
	password: ["password", "pass", "pw", "パスワード", "暗証番号"],
	label: ["label", "group", "ラベル", "見出し", "グループ", "階", "場所"],
	encryption: ["encryption", "security", "auth", "暗号化方式", "暗号化", "認証方式"],
};

function normalizeColumnName(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/[\s_-]/g, "");
}

// 区切り文字はタブとカンマのどちらもありうる。ヘッダ行に多く現れる方を採る
function detectDelimiter(headerLine: string): string {
	return headerLine.split("\t").length > headerLine.split(",").length ? "\t" : ",";
}

// 引用符の中では区切り文字も改行も値の一部として扱う必要があるため、
// split ではなく 1 文字ずつ走査する
function splitRow(row: string, delimiter: string): string[] {
	const values: string[] = [];
	let current = "";
	let quoted = false;

	for (let index = 0; index < row.length; index++) {
		const char = row[index];

		if (quoted) {
			if (char === '"') {
				if (row[index + 1] === '"') {
					current += '"';
					index++;
				} else {
					quoted = false;
				}
			} else {
				current += char;
			}
			continue;
		}

		if (char === '"') {
			quoted = true;
		} else if (char === delimiter) {
			values.push(current);
			current = "";
		} else {
			current += char;
		}
	}
	values.push(current);

	return values.map((value) => value.trim());
}

function findColumn(header: string[], key: keyof typeof COLUMN_ALIASES): number {
	const aliases = COLUMN_ALIASES[key];
	return header.findIndex((name) => aliases.includes(normalizeColumnName(name)));
}

export function parseWifiCsv(input: string): ParseResult {
	const lines = input.split(/\r?\n/);
	const headerIndex = lines.findIndex((line) => line.trim() !== "");
	if (headerIndex === -1) {
		return { entries: [], errors: [] };
	}

	const headerLine = lines[headerIndex] ?? "";
	const delimiter = detectDelimiter(headerLine);
	const header = splitRow(headerLine, delimiter);

	const columns = {
		ssid: findColumn(header, "ssid"),
		password: findColumn(header, "password"),
		label: findColumn(header, "label"),
		encryption: findColumn(header, "encryption"),
	};

	if (columns.ssid === -1) {
		return { entries: [], errors: [{ line: headerIndex + 1, message: "ssid 列が見つかりません" }] };
	}

	const entries: WifiEntry[] = [];
	const errors: ParseError[] = [];

	for (let index = headerIndex + 1; index < lines.length; index++) {
		const raw = lines[index] ?? "";
		if (raw.trim() === "") {
			continue;
		}

		const line = index + 1;
		const values = splitRow(raw, delimiter);
		const at = (column: number) => (column === -1 ? "" : (values[column] ?? ""));

		const ssid = at(columns.ssid);
		if (ssid === "") {
			errors.push({ line, message: "SSID がありません" });
			continue;
		}

		const rawEncryption = at(columns.encryption);
		const encryption = (rawEncryption === "" ? "WPA" : rawEncryption) as Encryption;
		if (!ENCRYPTIONS.includes(encryption)) {
			errors.push({ line, message: `暗号化方式が不正です: ${rawEncryption}` });
			continue;
		}

		const password = at(columns.password);
		if (encryption !== "nopass" && password === "") {
			errors.push({ line, message: "パスワードがありません" });
			continue;
		}

		entries.push({ ssid, password, label: at(columns.label), encryption, hidden: false });
	}

	return { entries, errors };
}
