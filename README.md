# WiFi QR ジェネレーター

SSID とパスワードから、WiFi 接続用の QR コードを作成するツールです。
スマートフォンのカメラで読み取るだけでネットワークに接続できます。

https://yui666a.github.io/wifi-qr-generator/

## できること

- SSID・パスワード・暗号化方式（WPA/WEP/暗号化なし）から QR コードを生成
- ステルス SSID（非公開ネットワーク）に対応
- PNG でのダウンロード
- 印刷用カードの出力（QR とネットワーク名・パスワードを併記）

入力した内容はブラウザの中だけで処理されます。サーバーへの送信は一切ありません。

## 使い方

1. ネットワーク名（SSID）を入力する
2. 暗号化方式を選び、パスワードを入力する
3. 表示された QR コードを PNG で保存するか、「カードを印刷」で掲示用に印刷する

印刷ダイアログで「PDF として保存」を選べば、PDF としても残せます。

## QR コードの形式

[ZXing の Barcode Contents 仕様](https://github.com/zxing/zxing/wiki/Barcode-Contents)に従った
`WIFI:` 形式の文字列を QR コードにしています。iOS・Android とも標準のカメラアプリが対応しています。

```
WIFI:T:WPA;S:MyHomeWiFi;P:p@ssw0rd123;H:false;;
```

`\` `;` `,` `"` `:` はバックスラッシュでエスケープし、16 進数としても読める値は
ダブルクォートで囲みます。

## 開発

```bash
pnpm install
pnpm dev          # 開発サーバー
pnpm test         # テスト（watch）
pnpm test:run     # テスト（1回）
pnpm lint         # Biome
pnpm typecheck    # tsc --noEmit
pnpm build        # 静的ビルド → dist/client
```

### 技術構成

| 項目 | 内容 |
| --- | --- |
| フレームワーク | TanStack Start（プリレンダによる静的出力） |
| ビルド | Vite 7 |
| スタイル | Tailwind CSS v4 |
| QR 生成 | qrcode |
| テスト | Vitest |
| Lint / Format | Biome |

### GitHub Pages へのデプロイ

`main` への push で GitHub Actions が動き、`dist/client` を Pages に配信します。
プロジェクトページはリポジトリ名配下に置かれるため、CI から `BASE_PATH` を渡しています。

TanStack Start の公式ドキュメントに静的ホスティング向けの記載はなく、この構成は
`vite` の `base` と `router.basepath` の双方を揃えることで動かしています。
片方だけではプリレンダのクロール起点がずれて失敗します。
