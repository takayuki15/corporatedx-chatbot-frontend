# RAG API モックデータ

RAG自動回答システムAPI (`/v1/rag`) のモックレスポンスデータです。

## 📁 ファイル構成

```
src/mocks/
├── ragNoIndexAvailable.json   # パターン1: インデックス不在
├── ragFaqOnly.json             # パターン2: FAQ回答のみ
├── ragOnly.json                # パターン3: RAG回答のみ
├── ragFaqAndRag.json           # パターン4: FAQ + RAG両方
├── ragErrorBadRequest.json     # 400エラー
├── ragErrorNotFound.json       # 404エラー
└── ragErrorServerError.json    # 500エラー
```

## 🎯 レスポンスパターン

### パターン1: インデックスが存在しない場合
業務小分類に対応するインデックスが存在しない、または無効化されている場合。

**ファイル**: `ragNoIndexAvailable.json`

主要フィールド:
- `no_index_available`: true
- `message`: 固定メッセージ

### パターン2: FAQ回答のみ
FAQインデックスのみが有効で、検索結果がある場合。

**ファイル**: `ragFaqOnly.json`

主要フィールド:
- `faq_answer`: string[]
- `faq_source_files`: string[]
- `faq_chunk_ids`: string[]

### パターン3: RAG回答のみ
RAGインデックスのみが有効で、LLMが回答を生成した場合。

**ファイル**: `ragOnly.json`

主要フィールド:
- `rag_answer`: string
- `rag_source_files`: string[]
- `rag_chunk_ids`: string[]

### パターン4: FAQ + RAG両方
FAQとRAGの両方が有効で、両方の結果がある場合。

**ファイル**: `ragFaqAndRag.json`

主要フィールド:
- `faq_answer`: string[]
- `rag_answer`: string
- 両方のソースファイル・チャンクIDが含まれる

## 🔧 使用例

### Next.js API Route での使用

`src/app/api/employee/route.ts` の実装パターンに従い、JSONファイルを直接読み込みます。

```typescript
import { readFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { useMockApi } from '@/lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    // モックモードの場合
    if (useMockApi) {
      // クエリに応じて異なるモックファイルを読み込む
      let mockFileName = 'ragOnly.json';

      if (query.includes('機密')) {
        mockFileName = 'ragNoIndexAvailable.json';
      } else if (query.includes('FAQ')) {
        mockFileName = 'ragFaqOnly.json';
      } else if (query.includes('詳しく')) {
        mockFileName = 'ragFaqAndRag.json';
      }

      const mockFilePath = join(
        process.cwd(),
        'src',
        'mocks',
        mockFileName
      );
      const mockData = JSON.parse(readFileSync(mockFilePath, 'utf-8'));
      return NextResponse.json(mockData.body, { status: mockData.statusCode });
    }

    // 本番モードの場合
    // ... 実際のAPI呼び出し処理
  } catch (error) {
    // ... エラーハンドリング
  }
}
```

### エラーレスポンスの処理

```typescript
// モックモードでエラーをシミュレート
if (useMockApi && simulateError) {
  const errorFilePath = join(
    process.cwd(),
    'src',
    'mocks',
    'ragErrorBadRequest.json' // または ragErrorNotFound.json, ragErrorServerError.json
  );
  const errorData = JSON.parse(readFileSync(errorFilePath, 'utf-8'));
  return NextResponse.json(errorData.body, { status: errorData.statusCode });
}
```

## 🧪 テストシナリオ

### シナリオ1: 初回質問
**ファイル**: `ragOnly.json`
- session_idが生成される
- chat_historyに1往復の会話が記録される

### シナリオ2: 継続会話
**ファイル**: `ragFaqAndRag.json`
- 同じsession_idを使用
- chat_historyに複数の会話履歴が蓄積される

### シナリオ3: アクセス制限
**ファイル**: `ragNoIndexAvailable.json`
- no_index_available: true
- 固定メッセージが返される

### シナリオ4: エラーケース
- **バリデーションエラー**: `ragErrorBadRequest.json` (400)
- **検索結果なし**: `ragErrorNotFound.json` (404)
- **サーバーエラー**: `ragErrorServerError.json` (500)

## 📝 カスタマイズ

独自のモックデータを追加する場合：

1. 新しいJSONファイルを `src/mocks/` に作成
```json
{
  "statusCode": 200,
  "body": {
    "session_id": "...",
    "chat_history": [...],
    ...
  }
}
```

2. API Routeで読み込み
```typescript
const customMockPath = join(process.cwd(), 'src', 'mocks', 'customMock.json');
const customData = JSON.parse(readFileSync(customMockPath, 'utf-8'));
```

## 🔗 関連ドキュメント

- [API仕様書](../../docs/automated_answer_handler_api.md)
- プロジェクトルートの `docs/automated_answer_handler_api.md` を参照
