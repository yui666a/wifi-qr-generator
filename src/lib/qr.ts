import QRCode from "qrcode";

// 誤り訂正レベル M は、印刷して壁に貼る用途で多少の汚れや折れに耐えつつ
// セル数を抑えられる標準的な選択
const OPTIONS = { errorCorrectionLevel: "M", margin: 2 } as const;

// SVG を文字列のまま DOM に流し込むと dangerouslySetInnerHTML が必要になるため、
// data URL にして <img> で読み込む。拡大しても劣化しない利点はそのまま残る
export async function toSvgDataUrl(payload: string): Promise<string> {
	const svg = await QRCode.toString(payload, { ...OPTIONS, type: "svg" });
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function toPngDataUrl(payload: string): Promise<string> {
	return QRCode.toDataURL(payload, { ...OPTIONS, width: 1024 });
}
