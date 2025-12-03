# Corporate DX Chatbot Frontend

ムラタヘルプチャットボットのフロントエンドアプリケーション

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **UIライブラリ**: Material-UI (MUI) v7
- **スタイリング**: Emotion, Tailwind CSS v4
- **パッケージマネージャー**: pnpm
- **Node.js**: v22

## プロジェクト構成

```
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # 共通コンポーネント
│   ├── features/               # 機能別コンポーネント
│   ├── contexts/               # React Context
│   ├── hooks/                  # カスタムフック
│   ├── lib/                    # ライブラリ設定
│   ├── mocks/                  # モックデータ
│   ├── types/                  # 型定義
│   └── utils/                  # ユーティリティ関数
├── public/                     # 静的ファイル
├── Dockerfile                  # Docker設定
├── docker-compose.yml          # Docker Compose設定
└── next.config.ts              # Next.js設定
```

## 開発環境のセットアップ

### 前提条件

- Node.js 22以上
- pnpm 9以上

### インストール

```bash
# 依存関係のインストール
pnpm install
```

### 環境変数の設定

`.env.local`ファイルを作成して環境変数を設定：

```bash
# .env.exampleをコピー
cp .env.example .env.local

# .env.localを編集
# NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-hostname
# NEXT_PUBLIC_API_GATEWAY_ID=your-api-gateway-id
# USE_MOCK_API=true  # 開発時はモックAPIを使用
```

## 開発コマンド

```bash
# 開発サーバーを起動（http://localhost:3000）
pnpm dev

# 本番ビルド
pnpm build

# 本番サーバーを起動
pnpm start

# リントチェック
pnpm lint

# クリーンアップ
pnpm clean
```

## Docker での起動

### Docker Compose を使用

```bash
# コンテナをビルドして起動
docker-compose up --build

# バックグラウンドで起動
docker-compose up -d

# コンテナ停止
docker-compose down
```

### Docker コマンドを直接使用

```bash
# イメージをビルド
docker build -t coworker-chatbot .

# コンテナを起動
docker run -p 3000:3000 coworker-chatbot
```

**アクセスURL:** http://localhost:3000

## 主な機能

- チャットインターフェース
- メッセージ送受信
- ファイルアップロード
- レスポンシブデザイン
- アクセシビリティ対応

## 設定ファイル

### Next.js 設定 (next.config.ts)

```typescript
const nextConfig: NextConfig = {
  basePath: '/chatbot',           // ベースパス
  trailingSlash: true,            // URLの末尾にスラッシュを追加
  allowedDevOrigins: [...],       // 開発時の許可オリジン
};
```

### TypeScript 設定 (tsconfig.json)

パスエイリアスを設定：

```typescript
// インポート例
import { Component } from '@/components/Component';
import { config } from '@root/config';
```

## コードスタイル

- **ESLint**: Next.js推奨設定 + カスタムルール
- **Prettier**: 自動フォーマット
- **import順序**: builtin → external → internal → parent → sibling → index

```bash
# リント実行
pnpm lint
```

## ディレクトリガイドライン

- `src/app/`: ページとルーティング（App Router）
- `src/components/`: 再利用可能なUIコンポーネント
- `src/features/`: 機能ごとにまとめたコンポーネント群
- `src/contexts/`: グローバルステート管理
- `src/hooks/`: カスタムフック
- `src/lib/`: 外部ライブラリの設定
- `src/mocks/`: 開発用モックデータ
- `src/types/`: TypeScript型定義
- `src/utils/`: 汎用ユーティリティ関数

## トラブルシューティング

### 依存関係の問題

```bash
# node_modulesを削除して再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### ビルドエラー

```bash
# .nextディレクトリをクリーン
pnpm clean
pnpm build
```

### ポート競合

デフォルトポート3000が使用中の場合：

```bash
# 別のポートで起動
pnpm dev -- -p 3001
```

## 本番環境デプロイ

1. 環境変数を本番用に設定
2. `NODE_ENV=production`を設定
3. `USE_MOCK_API=false`を設定（実際のAPIを使用）
4. ビルドして起動

```bash
NODE_ENV=production pnpm build
pnpm start
```

## ライセンス

Private - 社内利用のみ
