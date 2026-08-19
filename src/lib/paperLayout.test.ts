import { describe, expect, it } from "vitest";
import { PER_PAGE_CHOICES, paginate, pickPerPage } from "./paperLayout";

describe("pickPerPage", () => {
	describe("枚数が最小になる配置を選ぶ", () => {
		it.each([
			[1, 6],
			[6, 6],
			[7, 8],
			[8, 8],
			[9, 12],
			[12, 12],
		])("%d 件なら 1 枚に収まる最小の配置 %d を選ぶ", (count, expected) => {
			expect(pickPerPage(count)).toBe(expected);
		});

		it("1 枚に収まらない件数では最大の配置を選ぶ", () => {
			expect(pickPerPage(13)).toBe(12);
			expect(pickPerPage(22)).toBe(12);
			expect(pickPerPage(100)).toBe(12);
		});

		it("0 件でも最小の配置を返す", () => {
			expect(pickPerPage(0)).toBe(6);
		});
	});

	it("選べる配置は 1 枚あたりの件数として昇順に並ぶ", () => {
		expect(PER_PAGE_CHOICES.map((choice) => choice.perPage)).toEqual([6, 8, 12]);
	});

	it("どの配置も列数 × 行数が 1 枚あたりの件数に一致する", () => {
		for (const choice of PER_PAGE_CHOICES) {
			expect(choice.columns * choice.rows).toBe(choice.perPage);
		}
	});
});

describe("paginate", () => {
	it("指定した件数ごとにページへ分ける", () => {
		const pages = paginate(["a", "b", "c", "d", "e"], 2);

		expect(pages).toEqual([["a", "b"], ["c", "d"], ["e"]]);
	});

	it("ちょうど割り切れるときは端数のページを作らない", () => {
		const pages = paginate(["a", "b", "c", "d"], 2);

		expect(pages).toHaveLength(2);
	});

	it("22 件を 12 件ずつなら 2 ページになる", () => {
		const pages = paginate(
			Array.from({ length: 22 }, (_, i) => i),
			12,
		);

		expect(pages).toHaveLength(2);
		expect(pages[0]).toHaveLength(12);
		expect(pages[1]).toHaveLength(10);
	});

	it("空の入力ではページを作らない", () => {
		expect(paginate([], 12)).toEqual([]);
	});
});
