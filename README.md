# Shift Importer
使いたい人は[こちら](https://github.com/ars0611/shift-import/releases/tag/ZIP)を参照。ストアの審査が通るまで、OAuth認証使うためにテストユーザーにGoogleアカウントのメールアドレスを追加する必要があるので、連絡ください。
> この README は Codex の支援で作成・編集しています。実装コードは作者本人が作成しています。

Google スプレッドシートのシフト表を Google カレンダーへ取り込む Chrome 拡張です。  
シフトの一括反映と、月収見込みの確認を同じ UI で行えます。

## 利用者向け（使い方・背景）

### 何ができるか
- Google スプレッドシートからシフト情報を読み取り、Google カレンダーへ一括登録
- 取り込み前にプレビューで確認してから反映
- 時給・交通費を保存して、予想月収 / 実月収を管理

### 作成背景
- インターン先のシフト確認が Google スプレッドシート運用で、確認コストが高かった
- 自分に必要な出勤情報だけを素早く見たい課題があった
- 扶養上限管理のために、シフト管理と収入管理を別運用していて手間が大きかった
- これを解消するため、シート読込からカレンダー反映、収入見込み確認までを一体化した

### 想定利用と前提
- 作者本人のインターン先シフト運用を前提に最適化
- シート名・日付形式・時刻セル形式など、特定フォーマットを前提
- 汎用シフト管理ツールではなく、対象業務の省力化ツール

### 使い方
1. 取り込み対象の Google スプレッドシートを開き、対象シートを表示した状態にする
2. 拡張ポップアップを開き、Google アカウント連携を行う
3. `日付 / 出勤 / 退勤` のセル範囲を入力して「シートを読み込む」を押す
4. モーダルのプレビューを確認し、「この内容で取り込む」を押す
5. 必要に応じて時給・交通費を更新し、給与情報を確認する

### シート入力仕様
- シート名に `YYYY年M月` を含める（例: `2026年3月`）
- 日付列は `M月D日` 形式（例: `3月12日`）
- 出勤 / 退勤列は `0 <= 値 < 24` の数値（例: `10.5` は `10:30`）
- 空セルは勤務なしとして扱う
- 日付・出勤・退勤の各範囲は開始行と終了行をそろえる

### 取り込み時の挙動
- 対象期間の既存予定から、`source = shift-import` の予定のみ削除して再作成
- 予定の作成先カレンダーは `primary` 固定
- 予想月収は「取り込んだシフト月の翌月キー」で保存
- 予想月収計算では固定の休憩時間帯を差し引いて計算

### 注意事項
- ポップアップ操作時は、対象のスプレッドシートタブをアクティブにする
- OAuth / API 設定が未完了の場合、認証・読み込み・取り込みは失敗する

## 開発者向け（技術情報）

### 技術スタック
- Framework: WXT, React
- Language: TypeScript
- Styling: Tailwind CSS
- Package Manager: pnpm
- Build Tool: Vite（WXT 経由）
- Extension Platform: Chrome Extensions Manifest V3
- External APIs: Google Sheets API, Google Calendar API

### 動作要件
- Node.js 20 以上（推奨）
- pnpm
- Google Chrome
- Google Cloud で OAuth クライアント設定済み

### 環境変数
`.env` に以下を設定します。

```env
WXT_OAUTH_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WXT_EXTENSION_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----...-----END PUBLIC KEY-----
```

- `WXT_OAUTH_CLIENT_ID`: OAuth クライアント ID（`.apps.googleusercontent.com` を除いた部分）
- `WXT_EXTENSION_PUBLIC_KEY`: 拡張機能 ID 固定のための公開鍵

### セットアップ
```bash
pnpm install
pnpm dev
```

### 開発コマンド
- `pnpm dev`: Chrome 向け開発ビルド
- `pnpm dev:firefox`: Firefox 向け開発ビルド
- `pnpm compile`: TypeScript 型チェック
- `pnpm build`: 本番ビルド
- `pnpm build:firefox`: Firefox 向け本番ビルド
- `pnpm zip`: Chrome 配布用 zip 作成
- `pnpm zip:firefox`: Firefox 配布用 zip 作成

### 拡張機能の読み込み（Chrome）
1. `chrome://extensions` を開く
2. 「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」で以下を選択

- 開発中: `.output/chrome-mv3-dev`
- ビルド成果物: `.output/chrome-mv3`
