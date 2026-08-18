type Props = {
	svgDataUrl: string;
	ssid: string;
	password: string;
	showPassword: boolean;
};

export function PrintCard({ svgDataUrl, ssid, password, showPassword }: Props) {
	return (
		<div className="print-card hidden">
			<div className="w-[110mm] rounded-2xl border-2 border-slate-900 p-8 text-center">
				<p className="text-2xl font-bold tracking-wide">Wi-Fi</p>
				<img className="mx-auto my-6 w-[70mm]" src={svgDataUrl} alt="Wi-Fi 接続用 QR コード" />
				<p className="text-sm text-slate-600">カメラで読み取ると接続できます</p>
				<dl className="mt-4 space-y-1 text-left">
					<div className="flex gap-2">
						<dt className="w-24 shrink-0 text-sm text-slate-600">ネットワーク</dt>
						<dd className="break-all font-mono text-base font-semibold">{ssid}</dd>
					</div>
					{showPassword && (
						<div className="flex gap-2">
							<dt className="w-24 shrink-0 text-sm text-slate-600">パスワード</dt>
							<dd className="break-all font-mono text-base font-semibold">{password}</dd>
						</div>
					)}
				</dl>
			</div>
		</div>
	);
}
