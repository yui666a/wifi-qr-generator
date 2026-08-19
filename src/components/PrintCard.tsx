type Props = {
	svgDataUrl: string;
	ssid: string;
	password: string;
	showPassword: boolean;
	label?: string;
	compact?: boolean;
	/** compact 時の QR の幅。配置によって使える幅が違うため呼び出し側が決める */
	qrWidthMm?: number;
};

export function PrintCard({
	svgDataUrl,
	ssid,
	password,
	showPassword,
	label,
	compact = false,
	qrWidthMm = 32,
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
				className={`mx-auto ${compact ? "my-1" : "my-6 w-[70mm]"}`}
				style={compact ? { width: `${qrWidthMm}mm` } : undefined}
				src={svgDataUrl}
				alt={`${ssid} の Wi-Fi 接続用 QR コード`}
			/>
			{!compact && <p className="text-sm text-slate-600">カメラで読み取ると接続できます</p>}
			{/* mt-auto で最下部へ押し付けると、行に余りがあるとき QR との間だけが
			    大きく空いて間延びする。中身は上から詰めて余りはカード下に残す */}
			<dl className={`space-y-0.5 text-left ${compact ? "text-[9pt]" : "mt-4 text-base"}`}>
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
