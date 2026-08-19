import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BulkInput } from "../components/BulkInput";
import { PrintCard } from "../components/PrintCard";
import { PrintSheet, type SheetCard } from "../components/PrintSheet";
import { QrPreview } from "../components/QrPreview";
import { WifiForm } from "../components/WifiForm";
import { PER_PAGE_CHOICES, paginate, pickPerPage } from "../lib/paperLayout";
import { parseWifiCsv } from "../lib/parseWifiCsv";
import { toPngDataUrl, toSvgDataUrl } from "../lib/qr";
import { buildWifiPayload, type WifiConfig } from "../lib/wifiPayload";

export const Route = createFileRoute("/")({
	component: Home,
});

type Mode = "single" | "bulk";

const INITIAL: WifiConfig = { ssid: "", password: "", encryption: "WPA", hidden: false };

const MODES: [Mode, string][] = [
	["single", "1 件ずつ"],
	["bulk", "まとめて作成"],
];

function Home() {
	const [mode, setMode] = useState<Mode>("single");

	return (
		<main className="mx-auto max-w-3xl px-4 py-10">
			<header className="no-print mb-6">
				<h1 className="text-2xl font-bold">WiFi QR ジェネレーター</h1>
				<p className="mt-2 text-sm text-slate-600">
					SSID とパスワードを入力すると、接続用の QR コードを作成します。
					入力した内容はブラウザの中だけで処理され、どこにも送信されません。
				</p>
			</header>

			<div className="no-print mb-6 flex gap-1 rounded-lg bg-slate-200 p-1">
				{MODES.map(([value, text]) => (
					<button
						key={value}
						type="button"
						className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
							mode === value ? "bg-white shadow-sm" : "text-slate-600"
						}`}
						onClick={() => setMode(value)}
					>
						{text}
					</button>
				))}
			</div>

			{mode === "single" ? <SinglePanel /> : <BulkPanel />}
		</main>
	);
}

function SinglePanel() {
	const [config, setConfig] = useState<WifiConfig>(INITIAL);
	const [qr, setQr] = useState<{ svg: string; png: string } | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let payload: string;
		try {
			payload = buildWifiPayload(config);
		} catch (e) {
			setQr(null);
			// 未入力の初期状態でエラーを出すと煩わしいため、入力が始まるまでは黙る
			setError(config.ssid === "" ? null : (e as Error).message);
			return;
		}

		setError(null);
		let cancelled = false;
		Promise.all([toSvgDataUrl(payload), toPngDataUrl(payload)]).then(([svg, png]) => {
			if (!cancelled) {
				setQr({ svg, png });
			}
		});
		return () => {
			cancelled = true;
		};
	}, [config]);

	return (
		<>
			<div className="no-print grid gap-8 md:grid-cols-2">
				<section>
					<WifiForm value={config} onChange={setConfig} />
				</section>

				<section className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-6">
					{qr ? (
						<QrPreview svgDataUrl={qr.svg} pngDataUrl={qr.png} fileName={`wifi-${config.ssid}`} />
					) : (
						<p className="text-center text-sm text-slate-500">
							{error ?? "SSID を入力すると QR コードが表示されます"}
						</p>
					)}
				</section>
			</div>

			{qr && (
				<div className="print-card hidden">
					<div className="w-[110mm]">
						<PrintCard
							svgDataUrl={qr.svg}
							ssid={config.ssid}
							password={config.password}
							showPassword={config.encryption !== "nopass"}
						/>
					</div>
				</div>
			)}
		</>
	);
}

function BulkPanel() {
	const [text, setText] = useState("");
	const [manualPerPage, setManualPerPage] = useState<number | null>(null);
	const [svgs, setSvgs] = useState<Map<string, string>>(new Map());

	const result = useMemo(() => parseWifiCsv(text), [text]);
	const entries = result.entries;
	const autoPerPage = pickPerPage(entries.length);
	const perPage = manualPerPage ?? autoPerPage;
	const layout =
		PER_PAGE_CHOICES.find((choice) => choice.perPage === perPage) ?? PER_PAGE_CHOICES[0];

	useEffect(() => {
		let cancelled = false;
		const build = async () => {
			const next = new Map<string, string>();
			for (const entry of entries) {
				const payload = buildWifiPayload(entry);
				next.set(payload, await toSvgDataUrl(payload));
			}
			if (!cancelled) {
				setSvgs(next);
			}
		};
		build();
		return () => {
			cancelled = true;
		};
	}, [entries]);

	const cards: SheetCard[] = entries.map((entry, index) => {
		const payload = buildWifiPayload(entry);
		return {
			key: `${entry.ssid}-${index}`,
			svgDataUrl: svgs.get(payload) ?? "",
			ssid: entry.ssid,
			password: entry.password,
			showPassword: entry.encryption !== "nopass",
			label: entry.label,
		};
	});

	const pages = paginate(cards, perPage);

	return (
		<>
			<div className="no-print">
				<BulkInput
					text={text}
					onTextChange={setText}
					result={result}
					perPage={perPage}
					autoPerPage={autoPerPage}
					onPerPageChange={setManualPerPage}
					isAuto={manualPerPage === null}
					pageCount={pages.length}
				/>

				{pages.length > 0 && (
					<button
						type="button"
						className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
						onClick={() => window.print()}
					>
						印刷（A4 {pages.length} 枚）
					</button>
				)}
			</div>

			<div className="print-sheets hidden">
				{pages.map((page, index) => (
					<PrintSheet
						key={page[0]?.key ?? `page-${index}`}
						cards={page}
						columns={layout?.columns ?? 2}
						rows={layout?.rows ?? 3}
						qrWidthMm={layout?.qrWidthMm ?? 32}
					/>
				))}
			</div>
		</>
	);
}
