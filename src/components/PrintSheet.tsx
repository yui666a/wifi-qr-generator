import type { CSSProperties } from "react";
import { PrintCard } from "./PrintCard";

export type SheetCard = {
	key: string;
	svgDataUrl: string;
	ssid: string;
	password: string;
	showPassword: boolean;
	label: string;
};

type Props = {
	cards: SheetCard[];
	columns: number;
	rows: number;
	qrWidthMm: number;
};

// A4 1 枚分。印刷では 1 枚ごとに改ページし、画面では枠付きで並べて確認できる
export function PrintSheet({ cards, columns, rows, qrWidthMm }: Props) {
	// 行高の算出に行数が要る。CSS 側だけでは 1 枚あたりの件数を知りようがないため
	// 変数で渡す
	const style = {
		gridTemplateColumns: `repeat(${columns}, 1fr)`,
		"--sheet-rows": rows,
	} as CSSProperties;

	return (
		<div className="print-sheet grid gap-3" style={style}>
			{cards.map((card) => (
				<PrintCard
					key={card.key}
					svgDataUrl={card.svgDataUrl}
					ssid={card.ssid}
					password={card.password}
					showPassword={card.showPassword}
					label={card.label}
					compact
					qrWidthMm={qrWidthMm}
				/>
			))}
		</div>
	);
}
