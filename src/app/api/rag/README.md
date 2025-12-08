# RAG API エンドポイント

RAG自動回答システムのフロントエンドAPIエンドポイント実装です。

## 📍 エンドポイント

**POST** `/api/rag`

## 🔄 動作モード

### モックモード (`useMockApi = true`)
- `src/mocks/ragFaqAndRag.json` からレスポンスを返却
- バックエンドAPIへのリクエストなし
- 開発・テスト用

### 本番モード (`useMockApi = false`)
- バックエンドAPI `/v1/rag` にリクエストを転送
- 環境変数 `NEXT_PUBLIC_BACKEND_API_URL` で設定されたURLを使用
- `NEXT_PUBLIC_API_GATEWAY_ID` が設定されている場合は `x-apigw-api-id` ヘッダーを付与

## 📥 リクエスト

### 必須パラメータ

```typescript
{
  query: string;         // ユーザーの質問内容（1文字以上）
  company_code: string;  // 会社コード
  office_code: string;   // 事業所コード
}
```

### オプションパラメータ

```typescript
{
  session_id?: string;                          // セッション識別子（UUIDv4形式）
  model_name?: string;                          // 使用するLLMモデル (デフォルト: "gpt-4.1-mini")
  language?: string;                            // 入力言語 (デフォルト: "default")
  retrieval_mode?: 'hybrid' | 'bm25' | 'cos_sim'; // 検索モード (デフォルト: "hybrid")
  top_n?: number;                               // 返却するドキュメント数 (1～100, デフォルト: 5)
  rrf_k?: number;                               // RRFパラメータ (1以上, デフォルト: 5)
  is_query_expansion?: boolean;                 // クエリ拡張を使用するか (デフォルト: true)
  rerank_model_type?: 'aoai' | 'bedrock';       // リランキングモデルタイプ (デフォルト: "aoai")
  bedrock_model_name?: string;                  // Bedrockモデル名
  system_message?: string | null;               // カスタムシステムメッセージ
  llm_params?: {
    temperature?: number;           // 0.0～2.0
    frequency_penalty?: number;     // -2.0～2.0
    presence_penalty?: number;      // -2.0～2.0
    top_p?: number;                 // 0.0～1.0
    max_tokens?: number;            // 1～128000
    reasoning_effort?: 'minimal' | 'low' | 'medium' | 'high';
    verbosity?: 'low' | 'medium' | 'high';
  };
}
```

### リクエスト例

#### 最小構成
```bash
curl -X POST http://localhost:3000/api/rag \
  -H "Content-Type: application/json" \
  -d '{
    "query": "経費精算の期限はいつですか？",
    "company_code": "MMC",
    "office_code": "MM00"
  }'
```

#### 推奨構成
```bash
curl -X POST http://localhost:3000/api/rag \
  -H "Content-Type: application/json" \
  -d '{
    "query": "経費精算の期限はいつですか？",
    "company_code": "MMC",
    "office_code": "MM00",
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "language": "ja",
    "retrieval_mode": "hybrid",
    "top_n": 5
  }'
```

## 📤 レスポンス

### 成功レスポンス (200 OK)

レスポンスは4つのパターンがあります。詳細は[API仕様書](../../../docs/automated_answer_handler_api.md)を参照してください。

#### パターン1: インデックス不在
```json
{
  "session_id": "...",
  "chat_history": [...],
  "business_sub_categories": [...],
  "message": "頂いたご質問に関する情報については、回答できませんでした。...",
  "no_index_available": true
}
```

#### パターン2: FAQ回答のみ
```json
{
  "session_id": "...",
  "chat_history": [...],
  "business_sub_categories": [...],
  "faq_answer": [...],
  "faq_source_files": [...],
  "faq_chunk_ids": [...],
  "faq_source_texts": [...],
  "faq_metadata_list": [...]
}
```

#### パターン3: RAG回答のみ
```json
{
  "session_id": "...",
  "chat_history": [...],
  "business_sub_categories": [...],
  "rag_answer": "...",
  "rag_source_files": [...],
  "rag_chunk_ids": [...],
  "rag_source_texts": [...],
  "rag_metadata_list": [...]
}
```

#### パターン4: FAQ + RAG両方 (モックモードで返却)
```json
{
  "session_id": "...",
  "chat_history": [...],
  "business_sub_categories": [...],
  "faq_answer": [...],
  "faq_source_files": [...],
  "faq_chunk_ids": [...],
  "faq_source_texts": [...],
  "faq_metadata_list": [...],
  "rag_answer": "...",
  "rag_source_files": [...],
  "rag_chunk_ids": [...],
  "rag_source_texts": [...],
  "rag_metadata_list": [...]
}
```

### エラーレスポンス

#### 400 Bad Request - バリデーションエラー
```json
{
  "error": "query is required and must be a non-empty string"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## 🔍 バリデーション

### 必須パラメータ
- `query`: 空でない文字列
- `company_code`: 文字列
- `office_code`: 文字列

### オプションパラメータ
- `retrieval_mode`: `hybrid`, `bm25`, `cos_sim` のいずれか
- `top_n`: 1～100の整数
- `rrf_k`: 1以上の整数
- `rerank_model_type`: `aoai`, `bedrock` のいずれか
- `llm_params.temperature`: 0.0～2.0
- `llm_params.frequency_penalty`: -2.0～2.0
- `llm_params.presence_penalty`: -2.0～2.0
- `llm_params.top_p`: 0.0～1.0
- `llm_params.max_tokens`: 1～128000

## 🧪 TypeScript 使用例

### フロントエンドからの呼び出し

```typescript
import type { RagRequest, RagResponse } from '@/lib/api';

async function askQuestion(query: string): Promise<RagResponse> {
  const request: RagRequest = {
    query,
    company_code: 'MMC',
    office_code: 'MM00',
    language: 'ja',
    retrieval_mode: 'hybrid',
    top_n: 5,
  };

  const response = await fetch('/api/rag', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get RAG response');
  }

  return await response.json();
}

// 使用例
const result = await askQuestion('経費精算の期限はいつですか？');
console.log(result.rag_answer);
```

### React コンポーネント例

```tsx
import { useState } from 'react';
import type { RagResponse } from '@/lib/api';

function ChatComponent() {
  const [response, setResponse] = useState<RagResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/rag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          company_code: 'MMC',
          office_code: 'MM00',
          language: 'ja',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* UI implementation */}
    </div>
  );
}
```

## 🔗 関連ドキュメント

- [API仕様書](../../../docs/automated_answer_handler_api.md) - バックエンドAPIの詳細仕様
- [モックデータ README](../../../mocks/RAG_MOCKS_README.md) - モックデータの使用方法
- [型定義](../../../lib/api/types.ts) - TypeScript型定義

## 🛠️ 開発

### モードの切り替え

`.env.local` ファイルで設定:

```bash
# モックモード
NEXT_PUBLIC_USE_MOCK_API=true

# 本番モード
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-api.com
NEXT_PUBLIC_API_GATEWAY_ID=your-api-gateway-id
```

### テスト

```bash
# モックモードでテスト
npm run dev

# curlでテスト
curl -X POST http://localhost:3000/api/rag \
  -H "Content-Type: application/json" \
  -d '{"query":"test","company_code":"MMC","office_code":"MM00"}'
```
