import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PrintCard } from "../components/PrintCard";
import { QrPreview } from "../components/QrPreview";
import { WifiForm } from "../components/WifiForm";
import { toPngDataUrl, toSvgDataUrl } from "../lib/qr";
import { buildWifiPayload, type WifiConfig } from "../lib/wifiPayload";

export const Route = createFileRoute("/")({
	component: Home,
});

const INITIAL: WifiConfig = { ssid: "", password: "", encryption: "WPA", hidden: false };

function Home() {
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
		<main className="mx-auto max-w-3xl px-4 py-10">
			<header className="no-print mb-8">
				<h1 className="text-2xl font-bold">WiFi QR ジェネレーター</h1>
				<p className="mt-2 text-sm text-slate-600">
					SSID とパスワードを入力すると、接続用の QR コードを作成します。
					入力した内容はブラウザの中だけで処理され、どこにも送信されません。
				</p>
			</header>

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
				<PrintCard
					svgDataUrl={qr.svg}
					ssid={config.ssid}
					password={config.password}
					showPassword={config.encryption !== "nopass"}
				/>
			)}
		</main>
	);
}
