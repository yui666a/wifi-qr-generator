import { defineConfig } from "vitest/config";

// ロジックのテストに TanStack Start プラグインは不要なため、vite.config.ts とは
// 分離して素の vitest 設定で実行する
export default defineConfig({
	test: {
		include: ["src/**/*.test.ts"],
	},
});
