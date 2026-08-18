import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import appCss from "../styles/app.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "WiFi QR ジェネレーター" },
			{
				name: "description",
				content:
					"SSID とパスワードから WiFi 接続用の QR コードを作成します。入力はブラウザ内だけで処理され、どこにも送信されません。",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			// GitHub Pages ではリポジトリ名配下に配信されるため、BASE_URL を前置する
			{ rel: "icon", type: "image/svg+xml", href: `${import.meta.env.BASE_URL}favicon.svg` },
		],
	}),
	component: RootComponent,
});

function RootComponent() {
	return (
		<html lang="ja">
			<head>
				<HeadContent />
			</head>
			<body className="bg-slate-50 text-slate-900">
				<Outlet />
				<Scripts />
			</body>
		</html>
	);
}
