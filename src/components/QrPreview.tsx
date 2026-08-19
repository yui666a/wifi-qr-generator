import { printPage } from "../lib/print";

type Props = {
	svgDataUrl: string;
	pngDataUrl: string;
	fileName: string;
};

export function QrPreview({ svgDataUrl, pngDataUrl, fileName }: Props) {
	return (
		<div className="space-y-4">
			<img className="mx-auto w-full max-w-xs" src={svgDataUrl} alt="Wi-Fi 接続用 QR コード" />
			<div className="flex flex-wrap justify-center gap-3">
				<a
					className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
					href={pngDataUrl}
					download={`${fileName}.png`}
				>
					PNG をダウンロード
				</a>
				<button
					type="button"
					className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
					onClick={printPage}
				>
					カードを印刷
				</button>
			</div>
		</div>
	);
}
