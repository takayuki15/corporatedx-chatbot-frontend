# Corporate DX Monorepo

このリポジトリは複数のアプリケーションとパッケージを含むモノレポです。

## プロジェクト構成

```
├── apps/                       # アプリケーション
│   ├── chatbot/          # ムラタヘルプ
│   └── sample/                # 他アプリケーション
├── packages/                   # 共通パッケージ
│   ├── ui/                    # UIコンポーネント（MUIベース）
│   ├── utils/                 # 共通ユーティリティ
│   └── config/                # 環境変数・定数・ルート定義
├── infra/                      # インフラ設定
│   ├── docker/
│   └── github-actions/
├── turbo.json                  # Turborepo設定
├── pnpm-workspace.yaml         # pnpmワークスペース設定
└── tsconfig.base.json          # 共通TypeScript設定
```

## 技術スタック

- **パッケージマネージャー**: pnpm
- **ビルドツール**: Turborepo
- **フレームワーク**: Next.js 16
- **言語**: TypeScript
- **UIライブラリ**: Material-UI (MUI)
- **スタイリング**: Emotion, Tailwind CSS

## 開発コマンド

```bash
# すべてのアプリの開発サーバーを起動
pnpm dev

# すべてのアプリをビルド
pnpm build

# リントチェック
pnpm lint

# クリーンアップ
pnpm clean
```

## 個別アプリの操作

```bash
# chatbotアプリの開発サーバー起動
cd apps/chatbot
pnpm dev

# sampleアプリの開発サーバー起動（ポート3001）
cd apps/sample
pnpm dev
```

## パッケージの利用

共通パッケージはワークスペース経由で利用できます：

```typescript
// UIコンポーネント
import { Component } from '@coworker/ui';

// ユーティリティ
import { helper } from '@coworker/utils';

// 設定
import { ROUTES } from '@coworker/config';
```

## 既存Next.jsアプリケーションの移行

他のリポジトリで管理しているNext.jsアプリケーションをこのモノレポに移行する手順：

### 1. アプリケーションの移動

```bash
# このモノレポのapps配下に既存アプリをコピー
cp -r /path/to/existing-app /path/to/coworker-platform-frontend/apps/[アプリ名]
cd apps/[アプリ名]

# 既存のnode_modulesと.nextがあれば削除
rm -rf node_modules .next
```

### 2. package.jsonの調整例

既存のpackage.jsonを以下のように修正：

**必須の変更項目:**

```json
{
  "name": "@apps/[アプリ名]", // モノレポ命名規則に変更
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack --port [ポート番号]", // ポート番号を追加
    "build": "next build --turbopack",
    "start": "next start -p [ポート番号]", // ポート番号を追加
    "lint": "eslint",
    "clean": "rm -rf .next"
  },
  "dependencies": {
    // 共通パッケージへの依存を追加
    "@coworker/ui": "workspace:*",
    "@coworker/utils": "workspace:*",
    "@coworker/config": "workspace:*"

    // 既存の依存関係はそのまま維持
    // ...
  },
  "devDependencies": {
    // 開発用依存関係はそのまま維持
    // ...
  }
}
```

**ポート番号の割り当て:**

- chatbot: 3000（デフォルト）
- sample: 3001
- 新規アプリ: 3002以降を使用

### 3. tsconfig.jsonの調整例

モノレポの共通設定を継承するように変更：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
    // 既存の個別設定があれば追加
    // ...
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 4. 共通機能の移行（オプション）

共通化できる機能は共通パッケージに移行することを検討：

```bash
# UIコンポーネント → packages/ui
# ユーティリティ関数 → packages/utils
# 環境変数・定数 → packages/config
```

**移行例:**

```typescript
// 移行前
import { Button } from '../components/Button';

// 移行後（共通パッケージ化した場合）
import { Button } from '@coworker/ui';
```

### 6. 不要な設定ファイルの確認

以下のファイルがモノレポのルート設定と重複する場合は削除を検討：

- `.eslintrc.js` / `eslint.config.js`（ルート設定を使用）
- `.prettierrc`（ルート設定を使用）
- パッケージマネージャー設定（`package-lock.json`, `yarn.lock`など）

### 7. 依存関係のインストール

```bash
# プロジェクトルートで実行
cd ../..
pnpm install
```

### 8. アプリケーションの動作確認

```bash
# 個別起動で確認
cd apps/[アプリ名]
pnpm dev

# ビルド確認
pnpm build

# リント確認
pnpm lint
```

### 9. 全体での動作確認

```bash
# ルートから全アプリケーション起動
cd ../..
pnpm dev

# 全体ビルド
pnpm build

# 全体リント
pnpm lint
```

### トラブルシューティング

**依存関係のバージョン競合:**

```bash
# pnpm-lock.yamlを削除して再インストール
rm pnpm-lock.yaml
pnpm install
```

**ポート競合:**

package.jsonの`dev`と`start`スクリプトでポート番号を確認・変更

**型エラー:**

tsconfig.jsonの`extends`が正しく設定されているか確認

**共通パッケージが見つからない:**

```bash
# ワークスペースの再リンク
pnpm install --force
```

## Docker起動

Dockerコンテナとしてアプリケーションを起動できます。

```bash
# 全アプリを起動
docker-compose up --build

# 特定のアプリのみ起動
docker-compose up --build chatbot
docker-compose up --build sample

# バックグラウンドで起動
docker-compose up -d

# コンテナ停止
docker-compose down

# または直接Dockerコマンドを使用
docker build --build-arg APP_NAME=chatbot --build-arg PORT=3000 -t coworker-chatbot .
docker run -p 3000:3000 coworker-chatbot

docker build --build-arg APP_NAME=sample --build-arg PORT=3001 -t coworker-sample .
docker run -p 3001:3001 coworker-sample
```

**アクセスURL:**

- chatbot: http://localhost:3000
- sample: http://localhost:3001
