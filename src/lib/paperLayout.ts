export type PerPageChoice = {
	perPage: number;
	columns: number;
	label: string;
};

// A4 縦 1 枚に対する配置。列数が増えるほど QR は小さくなるため、
// 読み取りやすさと枚数のどちらを取るかを利用者が選べるようにしている
export const PER_PAGE_CHOICES: PerPageChoice[] = [
	{ perPage: 6, columns: 2, label: "6 枚（大きめ）" },
	{ perPage: 8, columns: 2, label: "8 枚" },
	{ perPage: 12, columns: 3, label: "12 枚（小さめ）" },
];

// 枚数が最小になる配置を選ぶ。1 枚に収まらないなら最も詰まる配置を使う
export function pickPerPage(count: number): number {
	const fits = PER_PAGE_CHOICES.find((choice) => count <= choice.perPage);
	return fits?.perPage ?? PER_PAGE_CHOICES[PER_PAGE_CHOICES.length - 1]?.perPage ?? 12;
}

export function paginate<T>(items: T[], perPage: number): T[][] {
	const pages: T[][] = [];
	for (let index = 0; index < items.length; index += perPage) {
		pages.push(items.slice(index, index + perPage));
	}
	return pages;
}
