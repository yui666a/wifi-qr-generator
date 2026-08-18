# WiFi QR ジェネレーター 設計

作成日: 2026-08-18

## 目的

来客に WiFi のパスワードを口頭やメモで伝える手間をなくす。
SSID とパスワードから接続用の QR コードを作り、掲示できるカードとして印刷できるようにする。

## スコープ

初回リリースに含めるもの。

- SSID・パスワード・暗号化方式（WPA / WEP / 暗号化なし）の入力
- ステルス SSID の指定
- QR コードの表示と PNG ダウンロード
- 印刷用カードの出力（QR とネットワーク名・パスワードを併記）

含めないもの。

- QR の色やロゴのカスタマイズ（読み取り率の検証コストに見合わない）
- 入力値の URL 共有（パスワードが履歴や Referer に残る）
- SVG ダウンロード（PNG と印刷で用途は足りる）

## 全体構成

ネットワーク通信を持たない静的サイトとして作る。入力値はすべてブラウザ内に閉じ、
サーバーへは送信しない。これは設計上の制約ではなく、このツールの主要な性質である
（パスワードを扱うため）。

| 項目 | 選択 |
| --- | --- |
| フレームワーク | TanStack Start（プリレンダによる静的出力） |
| ビルド | Vite 7 |
| スタイル | Tailwind CSS v4 |
| QR 生成 | qrcode |
| テスト | Vitest |
| Lint / Format | Biome |
| 配信 | GitHub Pages プロジェクトページ |

## モジュール

### `src/lib/wifiPayload.ts`

`WIFI:` 形式の文字列を組み立てる純粋関数。フレームワークにも DOM にも依存しない。
このツールで唯一ロジックらしいロジックであり、テストはここに集約する。

```ts
buildWifiPayload({ ssid, password, encryption, hidden }): string
```

[ZXing の Barcode Contents 仕様](https://github.com/zxing/zxing/wiki/Barcode-Contents)に従う。

- `\` `;` `,` `"` `:` の 5 文字をバックスラッシュでエスケープする
- 16 進数としても読める値はダブルクォートで囲む（リーダーがバイト列と誤認するため）
- `nopass` のときは `P:` を出力しない
- SSID 空、または暗号化ありでパスワード空のときは例外を投げる

### `src/lib/qr.ts`

ペイロードを QR 画像に変換する。SVG は data URL として返し、`<img>` で読み込む。
文字列のまま DOM へ流し込むと `dangerouslySetInnerHTML` が必要になるため。

誤り訂正レベルは M。印刷して壁に貼る用途で多少の汚れや折れに耐えつつ、
セル数を抑えられる標準的な選択。

### コンポーネント

| ファイル | 役割 |
| --- | --- |
| `components/WifiForm.tsx` | 入力フォーム。state を持たず、値と onChange を受け取る |
| `components/QrPreview.tsx` | QR 表示、PNG ダウンロード、印刷トリガ |
| `components/PrintCard.tsx` | 印刷用カード。画面では非表示 |
| `routes/index.tsx` | state を保持し、入力から QR までを繋ぐ |

## データフロー

```
WifiForm の state
  → buildWifiPayload()
  → toSvgDataUrl() / toPngDataUrl()
  → QrPreview / PrintCard
```

一方向。入力値は URL にもストレージにも保存しない。

## 印刷

PDF ライブラリは使わず、`@media print` でブラウザ印刷に流す。
日本語フォントの埋め込みでバンドルが数 MB 増えるのに見合わず、
OS の「PDF として保存」で PDF 化も足りるため。

印刷時は `.no-print` を消し、`.print-card` だけを A4 中央に配置する。
Tailwind の `hidden` を打ち消す必要があるが、`!important` は使わず
セレクタを重ねて詳細度で解決する。

カードにはパスワードを併記する。QR が読めない端末や、手入力したい人のため。

## テスト

`wifiPayload` を TDD で先に書く。仕様（What）として次を表現する。

- 通常のネットワーク、WEP、暗号化なし、ステルス
- 5 種類の特殊文字それぞれのエスケープと、複数同時のエスケープ
- 16 進数のみの SSID / パスワードのクォート、数字のみの値のクォート
- 16 進数以外を含む値は囲まないこと
- SSID 空・パスワード空の検証

加えて、生成した QR 画像を実際にデコードして元のペイロードに戻ることを確かめる
（`qr.decode.test.ts`）。文字列の組み立てが正しくても、画像として読み取れなければ
意味がないため。日本語 SSID を含む 6 ケース。

UI 側はロジックを持たないためテストを書かない。

## デプロイ

`main` への push で GitHub Actions が動き、`dist/client` を Pages に配信する。

TanStack Start は静的ホスティングを公式にはサポートしておらず、
公式ドキュメントに GitHub Pages 向けの記載もない。以下は実測で組み立てた構成である。

- `vite` の `base` と `tanstackStart({ router: { basepath } })` の**双方**に同じ値を渡す。
  片方だけではプリレンダのクロール起点がずれて失敗する
- SPA モードは使わない。有効にすると全ページが中身のないシェルになり、
  `index.html` 自体が生成されない
- Pages には rewrite が無いため、`index.html` を `404.html` にもコピーする
- `_shell.html` を Jekyll に握り潰させないため `.nojekyll` を置く

`router.basepath` はプラグインのスキーマには存在するが公開ドキュメントに記載がなく、
将来 `rewriteBasepath` への移行で壊れる可能性がある。

## 既知の制約

- WPA3 専用ネットワークについて、ZXing の仕様に SAE の記載はない。
  `T:WPA` で扱われるのが現状の慣行
- 動的パラメータを持つルートを足す場合、プリレンダの対象として明示列挙が必要
