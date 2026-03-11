# Shift Importer

Google スプレッドシートのシフト表を Google カレンダーへ取り込む Chrome 拡張です。  
シフトの一括反映と、月収見込みの確認を同じ UI で行えます。

## 背景と目的
- インターン先のシフト確認が Google スプレッドシート運用で、表示が重く確認に手間がかかっていた
- 自分に関係する出勤情報だけを素早く確認したかった
- 扶養上限を超えないための収入管理を別アプリで二重入力しており、運用コストが高かった
- 上記を解消するため、シートから直接カレンダー反映し、収入見込みまで一元管理できるようにした

## 想定利用と最適化前提
- 本プロダクトは作者本人のインターン先シフト運用を前提に作成
- シート名・日付形式・時刻セル形式など、対象職場の書式に最適化
- 汎用的なシフト管理ツールではなく、特定フォーマット向けの省力化ツール

## 主な機能
- Google アカウント連携（Chrome Identity API）
- シフト表セル範囲の指定読み込み（Sheets API `values:batchGet`）
- 取り込み前プレビュー（モーダル表示）
- カレンダー反映（Calendar API）
- 時給・交通費の保存（Chrome Sync Storage）
- 予想月収 / 実月収の管理と表示

## 技術スタック
- Framework: WXT, React
- Language: TypeScript
- Styling: Tailwind CSS
- Package Manager: pnpm
- Build Tool: Vite（WXT経由）
- Extension Platform: Chrome Extensions Manifest V3
- External APIs: Google Sheets API, Google Calendar API

## 動作要件
- Node.js 20 以上（推奨）
- pnpm
- Google Chrome
- Google Cloud で OAuth クライアント設定済み

## 環境変数
`.env` に以下を設定してください。

```env
WXT_OAUTH_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
WXT_EXTENSION_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----
```

- `WXT_OAUTH_CLIENT_ID`: Chrome 拡張向け OAuth クライアント ID
- `WXT_EXTENSION_PUBLIC_KEY`: 拡張機能 ID 固定のための公開鍵

## セットアップ
```bash
pnpm install
pnpm dev
```

### よく使うスクリプト
- `pnpm dev`: Chrome 向け開発ビルド
- `pnpm dev:firefox`: Firefox 向け開発ビルド
- `pnpm compile`: TypeScript 型チェック
- `pnpm build`: 本番ビルド
- `pnpm zip`: 配布用 zip 作成

## 拡張機能の読み込み
1. Chrome の `chrome://extensions` を開く
2. 「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」から以下を選択
- 開発中: `.output/chrome-mv3-dev`
- ビルド成果物: `.output/chrome-mv3`

## 使い方
1. 取り込み対象の Google スプレッドシートをアクティブタブで開く
2. 拡張ポップアップを開いて Google 連携する
3. 日付 / 出勤 / 退勤のセル範囲を入力して「シートを読み込む」を押す
4. モーダルのプレビューを確認して「この内容で取り込む」を押す
5. 必要に応じて時給・交通費を更新し、給与情報を確認する

## シート入力仕様
- シート名に `YYYY年M月` を含めること（例: `2026年3月`）
- 日付列は `M月D日` 形式（例: `3月12日`）
- 出勤 / 退勤列は 0 以上 24 未満の数値（例: `10.5` は 10:30）
- 空セルは勤務なしとして扱う
- 日付・出勤・退勤の各範囲は、開始行と終了行をそろえる

## 取り込み時の挙動
- 対象期間の既存イベントから、`source = shift-import` の予定だけを削除して再作成します
- 作成先カレンダーは `primary` 固定です
- 予想月収は「取り込んだシフト月の翌月キー」に保存します
- 予想月収の計算では、固定の休憩時間帯を差し引いて計算します

## 注意事項
- ポップアップ操作時、対象スプレッドシートを開いたタブをアクティブにしてください
- OAuth や API の設定が未完了だと、認証・読み込み・取り込みに失敗します

## このREADMEについて
この README は Codex（GPT-5 ベースのコーディングエージェント）による提案・編集を含みます。
