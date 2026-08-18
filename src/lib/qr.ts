import QRCode from "qrcode";
import logoSvg from "../assets/wifi-logo.svg?raw";

// ロゴで覆う分のセルが失われるため、誤り訂正レベルは H（約 30% 復元）にする。
// M では中央を隠した時点で読み取れなくなる余地が大きい
const OPTIONS = { errorCorrectionLevel: "H", margin: 2 } as const;

// ロゴが覆う一辺の割合。同条件のデコード検証では 0.30 まで読め 0.35 で読めなく
// なるため、限界の半分強にあたるこの値を採る。印刷の掠れや斜めからの読み取りで
// 実効的な復元能力は落ちるので、限界近くまで大きくはしない
const LOGO_RATIO = 0.2;

// ロゴの下に敷く白地の余白（ロゴ一辺に対する比率）。QR の黒セルと
// ロゴが直接触れると輪郭が潰れて読み取りに影響する
const LOGO_PADDING_RATIO = 0.12;

const LOGO_VIEW_BOX = extractAttribute(logoSvg, "viewBox") ?? "0 0 1 1";
const LOGO_BODY = logoSvg.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

function extractAttribute(svg: string, name: string): string | null {
	return new RegExp(`${name}="([^"]+)"`).exec(svg)?.[1] ?? null;
}

// qrcode が返す SVG に、中央のロゴと白地を差し込む。QR 側の viewBox は
// セル数 + margin の単位系なので、その座標系のまま比率で位置を決める
function embedLogo(qrSvg: string): string {
	const viewBox = extractAttribute(qrSvg, "viewBox");
	if (viewBox === null) {
		return qrSvg;
	}

	const [, , width = 0] = viewBox.split(/\s+/).map(Number);
	const logoSize = width * LOGO_RATIO;
	const padding = logoSize * LOGO_PADDING_RATIO;
	const plateSize = logoSize + padding * 2;
	const plateOffset = (width - plateSize) / 2;
	const logoOffset = (width - logoSize) / 2;

	const overlay = [
		`<rect x="${plateOffset}" y="${plateOffset}" width="${plateSize}" height="${plateSize}"`,
		` rx="${plateSize * 0.12}" fill="#ffffff"/>`,
		`<svg x="${logoOffset}" y="${logoOffset}" width="${logoSize}" height="${logoSize}"`,
		` viewBox="${LOGO_VIEW_BOX}">${LOGO_BODY}</svg>`,
	].join("");

	return qrSvg.replace(/<\/svg>\s*$/, `${overlay}</svg>`);
}

// SVG を文字列のまま DOM に流し込むと dangerouslySetInnerHTML が必要になるため、
// data URL にして <img> で読み込む。拡大しても劣化しない利点はそのまま残る
export async function toSvgDataUrl(payload: string): Promise<string> {
	const qrSvg = await QRCode.toString(payload, { ...OPTIONS, type: "svg" });
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(embedLogo(qrSvg))}`;
}

// PNG は Canvas に QR を描いたうえで、同じ比率のロゴを SVG 画像として重ねる。
// qrcode 自体にロゴ合成の機能は無いため、描画は自前で行う
export async function toPngDataUrl(payload: string): Promise<string> {
	const size = 1024;
	const canvas = document.createElement("canvas");
	canvas.width = size;
	canvas.height = size;

	await QRCode.toCanvas(canvas, payload, { ...OPTIONS, width: size });

	const context = canvas.getContext("2d");
	if (context === null) {
		return canvas.toDataURL("image/png");
	}

	const logoSize = size * LOGO_RATIO;
	const padding = logoSize * LOGO_PADDING_RATIO;
	const plateSize = logoSize + padding * 2;
	const plateOffset = (size - plateSize) / 2;
	const logoOffset = (size - logoSize) / 2;

	context.fillStyle = "#ffffff";
	context.beginPath();
	context.roundRect(plateOffset, plateOffset, plateSize, plateSize, plateSize * 0.12);
	context.fill();

	const logo = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg)}`);
	context.drawImage(logo, logoOffset, logoOffset, logoSize, logoSize);

	return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = reject;
		image.src = src;
	});
}
