type Props = {
	svgDataUrl: string;
	ssid: string;
	password: string;
	showPassword: boolean;
	label?: string;
	compact?: boolean;
};

export function PrintCard({
	svgDataUrl,
	ssid,
	password,
	showPassword,
	label,
	compact = false,
}: Props) {
	const heading = label === undefined || label === "" ? "Wi-Fi" : label;

	return (
		<div
			className={`flex h-full flex-col rounded-2xl border-2 border-slate-900 text-center ${
				compact ? "p-3" : "p-8"
			}`}
		>
			<p className={compact ? "text-sm font-bold" : "text-2xl font-bold tracking-wide"}>
				{heading}
			</p>
			{/* 幅で指定する。高さを flex で伸縮させるとグリッドの行高計算より先に
			    画像が伸びてしまい、シートがページ高を大きく超える */}
			<img
				className={`mx-auto ${compact ? "my-1 w-[32mm]" : "my-6 w-[70mm]"}`}
				src={svgDataUrl}
				alt={`${ssid} の Wi-Fi 接続用 QR コード`}
			/>
			{!compact && <p className="text-sm text-slate-600">カメラで読み取ると接続できます</p>}
			<dl className={`mt-auto space-y-0.5 text-left ${compact ? "text-[9pt]" : "mt-4 text-base"}`}>
				<div className={compact ? "" : "flex gap-2"}>
					<dt className={`text-slate-600 ${compact ? "text-[7pt]" : "w-24 shrink-0 text-sm"}`}>
						ネットワーク
					</dt>
					<dd className="break-all font-mono font-semibold">{ssid}</dd>
				</div>
				{showPassword && (
					<div className={compact ? "" : "flex gap-2"}>
						<dt className={`text-slate-600 ${compact ? "text-[7pt]" : "w-24 shrink-0 text-sm"}`}>
							パスワード
						</dt>
						<dd className="break-all font-mono font-semibold">{password}</dd>
					</div>
				)}
			</dl>
		</div>
	);
}
