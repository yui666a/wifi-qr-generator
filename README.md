# WiFi QR ジェネレーター

SSID とパスワードから、WiFi 接続用の QR コードを作成するツールです。
スマートフォンのカメラで読み取るだけでネットワークに接続できます。

https://yui666a.github.io/wifi-qr-generator/

## できること

- SSID・パスワード・暗号化方式（WPA/WEP/暗号化なし）から QR コードを生成
- QR コード中央に Wi-Fi 公式ロゴを配置
- ステルス SSID（非公開ネットワーク）に対応
- PNG でのダウンロード
- 印刷用カードの出力（QR とネットワーク名・パスワードを併記）
- 複数のネットワークをまとめて作成し、A4 に並べて印刷（1 枚あたり 6 / 8 / 12 枚から選択）

入力した内容はブラウザの中だけで処理されます。サーバーへの送信は一切ありません。

## 使い方

1. ネットワーク名（SSID）を入力する
2. 暗号化方式を選び、パスワードを入力する
3. 表示された QR コードを PNG で保存するか、「カードを印刷」で掲示用に印刷する

印刷ダイアログで「PDF として保存」を選べば、PDF としても残せます。

## まとめて作成

「まとめて作成」タブに CSV / TSV を貼り付けると、複数の QR を 1 枚の A4 に並べて印刷できます。
件数が多ければ 2 枚、3 枚と自動で分かれます。

```csv
ssid,password,label,encryption
regate_kaigi,regate2023!,地下,
1F-1_5G,KG4vNI95,1階,
FreeSpot,,ロビー,nopass
```

1 行目は列名です。列の順序は問いません。

| 列名 | 必須 | 内容 |
| --- | --- | --- |
| `ssid` | ○ | ネットワーク名 |
| `password` | △ | `nopass` 以外では必須 |
| `label` | | カード上部の見出し。空なら「Wi-Fi」 |
| `encryption` | | `WPA` / `WEP` / `nopass`。空なら `WPA` |

列名は `SSID`・`パスワード`・`ネットワーク名` のような表記ゆれも読みます。

1 枚あたりの枚数は既定では件数に応じて自動で決まりますが、6 / 8 / 12 枚から選び直せます。
枚数を減らすほど QR は小さくなるため、読み取りにくい環境では 6 枚を選んでください。

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

## 商標

QR コード中央の Wi-Fi ロゴは、Wi-Fi Alliance が
[ライセンスフリーで提供している Wi-Fi Cube Logo](https://www.wi-fi.org/our-brands) を使用しています。

Wi-Fi®、Wi-Fi CERTIFIED®、Wi-Fi Alliance®、Wi-Fi ロゴは Wi-Fi Alliance の商標です。
本ツールは Wi-Fi Alliance とは無関係であり、認証を受けたものでもありません。

「QRコード」は株式会社デンソーウェーブの登録商標です。
