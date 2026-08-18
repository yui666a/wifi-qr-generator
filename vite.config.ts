import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// GitHub Pages のプロジェクトページはリポジトリ名配下に配信されるため、CI から
// BASE_PATH=/wifi-qr-generator/ を渡す。ローカル開発ではルート配信。
const BASE = process.env.BASE_PATH ?? "/";

export default defineConfig({
	base: BASE,
	plugins: [
		tailwindcss(),
		tanstackStart({
			// vite の base だけではプリレンダのクロール起点が "/" のままになり失敗するため、
			// router.basepath にも同じ値を渡す
			router: { basepath: BASE },
			// SPA mode は併用しない。有効にすると全ページが中身のないシェルになり
			// index.html 自体が生成されない
			prerender: { enabled: true, crawlLinks: false, failOnError: true },
		}),
		viteReact(),
	],
});
