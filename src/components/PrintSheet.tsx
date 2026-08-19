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
};

// A4 1 枚分。印刷では 1 枚ごとに改ページし、画面では枠付きで並べて確認できる
export function PrintSheet({ cards, columns }: Props) {
	return (
		<div
			className="print-sheet grid gap-3"
			style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
		>
			{cards.map((card) => (
				<PrintCard
					key={card.key}
					svgDataUrl={card.svgDataUrl}
					ssid={card.ssid}
					password={card.password}
					showPassword={card.showPassword}
					label={card.label}
					compact
				/>
			))}
		</div>
	);
}
