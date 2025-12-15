# RAG自動回答システム API仕様書

## 概要

`src/automated_answer/handler.py` の Lambda関数は、業務小分類を自動識別し、FAQ/RAGドキュメントから適切な回答を生成する無人回答システムです。

**エンドポイント:** `/v1/automated_answer` (POST)

---

## 入力仕様

### リクエスト構造

```json
{
  "httpMethod": "POST",
  "path": "/rag",
  "headers": {
    "Content-Type": "application/json",
    "x-apigw-api-id": "YOUR_API_GATEWAY_ID"
  },
  "body": {
    // リクエストパラメータ（JSON形式）
  }
}
```

### リクエストパラメータ

#### 必須パラメータ

| パラメータ | 型       | 説明                                                | 例                               |
| ---------- | -------- | --------------------------------------------------- | -------------------------------- |
| `query`    | `string` | ユーザーの質問内容（1文字以上）                     | `"経費精算の期限はいつですか？"` |
| `company`  | `string` | 会社コード                                          | `"MMC"`                          |
| `office`   | `string` | 事業所コード                                        | `"MM00"`                         |
| `miam_id`  | `string` | 質問送信者のMIAMID（メールアドレス形式、1文字以上） | `"user@example.com"`             |

#### オプションパラメータ

| パラメータ                                    | 型        | デフォルト値     | 説明                                     | 制約                                             |
| --------------------------------------------- | --------- | ---------------- | ---------------------------------------- | ------------------------------------------------ |
| `session_id`                                  | `string?` | 自動生成         | セッション識別子（会話履歴管理用）       | UUIDv4形式                                       |
| `language`                                    | `string`  | `"default"`      | 入力言語                                 | ISO639-1 (`"ja"`, `"en"`) または `"default"`     |
| `business_sub_category_top_n`                 | `integer` | `5`              | 業務小分類予測時のドキュメント取得件数   | 1～100                                           |
| `business_sub_category_query_expansion_model` | `string`  | `"gpt-4.1-mini"` | 業務小分類判定時のクエリ拡張モデル       | Azure OpenAIモデル名                             |
| `business_sub_category_retrieval_mode`        | `string`  | `"hybrid"`       | 業務小分類判定時の検索方式               | `"hybrid"` / `"bm25"` / `"cos_sim"`              |
| `business_sub_category_retrieval_model`       | `string?` | `null`           | 業務小分類判定時の埋め込みモデル         | 指定しない場合はデフォルトのエンドポイントを使用 |
| `business_sub_category_rerank_model`          | `string`  | `"gpt-4.1-mini"` | 業務小分類判定時のリランキングモデル     | Azure OpenAIまたはBedrockのモデル名（自動判別）  |
| `answer_top_n`                                | `integer` | `5`              | FAQ回答とRAG回答時のドキュメント取得件数 | 1～100                                           |
| `answer_query_expansion_model`                | `string`  | `"gpt-4.1-mini"` | 回答生成時のクエリ拡張モデル             | Azure OpenAIモデル名                             |
| `answer_model`                                | `string`  | `"gpt-4.1-mini"` | RAG回答生成時に使用するLLMモデル         | Azure OpenAIモデル名                             |
| `answer_retrieval_mode`                       | `string`  | `"hybrid"`       | 回答生成時の検索方式                     | `"hybrid"` / `"bm25"` / `"cos_sim"`              |
| `answer_retrieval_model`                      | `string?` | `null`           | 回答生成時の埋め込みモデル               | 指定しない場合はデフォルトのエンドポイントを使用 |
| `answer_rerank_model`                         | `string`  | `"gpt-4.1-mini"` | 回答生成時のリランキングモデル           | Azure OpenAIまたはBedrockのモデル名（自動判別）  |
| `is_query_expansion`                          | `boolean` | `false`          | クエリ拡張の有無                         | true / false                                     |
| `is_rerank`                                   | `boolean` | `true`           | リランキングの有無                       | true / false                                     |
| `system_message`                              | `string?` | `null`           | カスタムシステムメッセージ               | RAG回答生成用のベースメッセージ                  |
| `rrf_k`                                       | `integer` | `5`              | Reciprocal Rank Fusionのkパラメータ      | 1以上                                            |
| `llm_params`                                  | `object`  | 下記参照         | LLMパラメータ                            | -                                                |

#### LLMパラメータ (`llm_params`)

```json
{
  "temperature": 0.0, // 0.0～2.0（ランダム性）
  "frequency_penalty": 0.0, // -2.0～2.0（繰り返しペナルティ）
  "presence_penalty": 0.0, // -2.0～2.0（話題の多様性）
  "top_p": 0.95, // 0.0～1.0（サンプリング）
  "max_tokens": 32768, // 1～128000（最大トークン数）
  "reasoning_effort": "medium", // "minimal" | "low" | "medium" | "high"
  "verbosity": "medium" // "low" | "medium" | "high"
}
```

### 検索モードの説明

| モード    | 説明                                                           |
| --------- | -------------------------------------------------------------- |
| `hybrid`  | BM25（キーワード検索）とベクトル検索を組み合わせた検索（推奨） |
| `bm25`    | キーワードベースの全文検索のみ                                 |
| `cos_sim` | セマンティックベクトル検索のみ                                 |

### リランキングモデルの自動判別

`business_sub_category_rerank_model`と`answer_rerank_model`パラメータは、モデル名から自動的にプラットフォームを判別します：

| モデル名のプレフィックス                                         | 判別されるプラットフォーム | 例                                             |
| ---------------------------------------------------------------- | -------------------------- | ---------------------------------------------- |
| `amazon.`, `cohere.`, `ai21.`, `meta.`, `mistral.`, `anthropic.` | AWS Bedrock                | `"amazon.rerank-v1:0"`, `"cohere.rerank-v3-5"` |
| その他（上記以外）                                               | Azure OpenAI               | `"gpt-4.1-mini"`, `"gpt-5"`                    |

**使用例:**

```json
{
  "business_sub_category_rerank_model": "gpt-4.1-mini", // Azure OpenAI として判別
  "answer_rerank_model": "cohere.rerank-v3-5" // Bedrock として判別
}
```

---

## リクエスト例

### 最小構成（必須パラメータのみ）

```json
{
  "query": "経費精算の期限はいつですか？",
  "company": "MMC",
  "office": "MM00",
  "miam_id": "user@example.com"
}
```

### 推奨構成

```json
{
  "query": "経費精算の期限はいつですか？",
  "company": "MMC",
  "office": "MM00",
  "miam_id": "user@example.com",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "model_name": "gpt-4.1-mini",
  "language": "ja",
  "retrieval_mode": "hybrid",
  "top_n": 5
}
```

### フル構成

```json
{
  "query": "経費精算の期限はいつですか？",
  "company": "MMC",
  "office": "MM00",
  "miam_id": "user@example.com",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "model_name": "gpt-4.1-mini",
  "language": "ja",
  "retrieval_mode": "hybrid",
  "top_n": 5,
  "business_sub_category_top_n": 5,
  "faq_top_n": 5,
  "rag_top_n": 5,
  "rrf_k": 5,
  "is_query_expansion": false,
  "is_rerank": true,
  "business_sub_category_rerank_model": "gpt-4.1-mini",
  "answer_rerank_model": "cohere.rerank-v3-5",
  "system_message": null,
  "llm_params": {
    "temperature": 0.0,
    "frequency_penalty": 0.0,
    "presence_penalty": 0.0,
    "top_p": 0.95,
    "max_tokens": 32768,
    "reasoning_effort": "medium",
    "verbosity": "medium"
  }
}
```

### curlコマンド例

#### 基本的なリクエスト（最小構成）

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/automated_answer" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "query": "経費精算の期限はいつですか？",
    "company": "MMC",
    "office": "MM00",
    "miam_id": "user@example.com"
  }'
```

#### オプションパラメータを含むリクエスト

```bash

```

---

## 出力仕様

### 成功レスポンス

#### ステータスコード: `200 OK`

**重要:** API GatewayがLambda関数のレスポンスを処理し、JSONオブジェクトとして返却します。クライアント側では直接JSONオブジェクトとしてアクセス可能です。

レスポンス構造:

```json
{
  "session_id": "string (UUIDv4形式)",
  "chat_history": [
    {
      "role": "user | assistant",
      "content": "string"
    }
  ],
  "business_sub_categories": ["string"],
  "priority_manned_counter_names": ["string"],
  // インデックスが存在しない場合のみ以下が含まれる
  "message": "string (固定メッセージ)",
  "no_index_available": true,
  // FAQ結果がある場合のみ以下が含まれる
  "faq": {
    "answer": ["string"], // FAQ回答リスト（検索結果をそのまま返却、最大faq_top_n件）
    "source_files": ["string"], // ソースファイル名リスト（最大faq_top_n件）
    "chunk_ids": ["string"], // チャンクIDリスト（最大faq_top_n件）
    "source_texts": ["string"], // チャンクテキストリスト（最大faq_top_n件）
    "metadata_list": ["string"] // JSON文字列のリスト（最大faq_top_n件）
  },
  // RAG結果がある場合のみ以下が含まれる
  "rag": {
    "answer": "string", // LLMが生成した回答文
    "source_files": ["string"], // ソースファイル名リスト（最大rag_top_n件）
    "chunk_ids": ["string"], // チャンクIDリスト（最大rag_top_n件）
    "source_texts": ["string"], // チャンクテキストリスト（最大rag_top_n件）
    "metadata_list": ["string"] // JSON文字列のリスト（最大rag_top_n件）
  }
}
```

### レスポンスボディの共通フィールド

| フィールド                      | 型              | 説明                                                            |
| ------------------------------- | --------------- | --------------------------------------------------------------- |
| `session_id`                    | `string`        | セッションID（UUIDv4形式）                                      |
| `chat_history`                  | `array<object>` | 対話履歴（質問・回答のペア）                                    |
| `chat_history[].role`           | `string`        | 発言者（"user" または "assistant"）                             |
| `chat_history[].content`        | `string`        | 発言内容                                                        |
| `business_sub_categories`       | `array<string>` | 特定された業務小分類リスト（最大business_sub_category_top_n件） |
| `priority_manned_counter_names` | `array<string>` | 優先的に表示する有人窓口名のリスト                              |

**注:**

- 有人窓口名は、特定された業務小分類（`business_sub_categories`）に対応する窓口名のみが含まれます。窓口名が設定されていない業務小分類は含まれません。
- `priority_manned_counter_names` は `/v1/get_manned_counter` API の `priority_manned_counter_names` パラメータとして使用できます。これにより、窓口の詳細情報（メールアドレス、説明、アクセス制限等）を取得できます。

#### FAQ/RAGフィールドの構造

**FAQレスポンス** (`faq`オブジェクト、FAQ結果がある場合のみ含まれる):

| フィールド          | 型              | 説明                                                                     |
| ------------------- | --------------- | ------------------------------------------------------------------------ |
| `faq.answer`        | `array<string>` | FAQ回答リスト（検索結果をそのまま返却、LLM生成なし、最大faq_top_n件）    |
| `faq.source_files`  | `array<string>` | FAQソースファイル名リスト（最大faq_top_n件）                             |
| `faq.chunk_ids`     | `array<string>` | FAQチャンクIDリスト（最大faq_top_n件）                                   |
| `faq.source_texts`  | `array<string>` | FAQ参照チャンクのテキストリスト（最大faq_top_n件）                       |
| `faq.metadata_list` | `array<string>` | FAQ参照チャンクのメタデータリスト（JSON文字列のリスト、最大faq_top_n件） |

**RAGレスポンス** (`rag`オブジェクト、RAG結果がある場合のみ含まれる):

| フィールド          | 型              | 説明                                                                     |
| ------------------- | --------------- | ------------------------------------------------------------------------ |
| `rag.answer`        | `string`        | LLMが生成した自然な回答文                                                |
| `rag.source_files`  | `array<string>` | RAGソースファイル名リスト（最大rag_top_n件）                             |
| `rag.chunk_ids`     | `array<string>` | RAGチャンクIDリスト（最大rag_top_n件）                                   |
| `rag.source_texts`  | `array<string>` | RAG参照チャンクのテキストリスト（最大rag_top_n件）                       |
| `rag.metadata_list` | `array<string>` | RAG参照チャンクのメタデータリスト（JSON文字列のリスト、最大rag_top_n件） |

**metadata_listの構造** （各要素はJSON文字列で、パース後の例）:

SharePointから取得したドキュメントの場合:

```json
{
  "file_id": "01UNH66NRXWNCIPGPKIBCYIJTXPXWCWYPF",
  "sharepoint_url": "https://murataglobal.sharepoint.com/sites/...",
  "parent_web_url": "https://murataglobal.sharepoint.com/sites/...",
  "last_modified": "2025-11-20T08:30:00Z",
  "etag": "\"{ABC123...}\"",
  "size": 1234567,
  "path": "markdown/MMC/出張・旅費精算/国内出張精算マニュアル.pdf.md",
  "activities": "[]",
  "file": "{...}",
  "mimeType": "application/pdf"
}
```

その他の典型的なフィールド:

```json
{
  "business_sub_category": "keiri",
  "office": ["MM00", "MM01"],
  "document_type": "規程",
  "file_path": "s3://bucket/path/to/file.pdf",
  "version": "2.3",
  "last_updated": "2025-10-15"
}
```

**重要な注意事項:**

1. **FAQとRAGの`answer`の違い**
   - **FAQ**: `answer`は配列形式で、複数のFAQ項目をそのまま返却（例: `["FAQ回答1", "FAQ回答2"]`）
   - **RAG**: `answer`は文字列形式で、LLMが複数ドキュメントを統合した1つの回答（例: `"統合された回答文"`）

2. **`source_texts`の内容**
   - Elasticsearchから取得した実際のドキュメントチャンク（チャンク化された原文）
   - FAQの場合: Q&A形式の完全なテキスト
   - RAGの場合: ドキュメントの該当セクション（見出しや段落を含む）

3. **`metadata_list`の構造**
   - 各要素はJSON文字列（エスケープされた形式）
   - クライアント側で個別に`JSON.parse()`する必要がある
   - SharePointから取得したドキュメントの場合、以下の情報が含まれる:
     - `file_id`: SharePointファイルID
     - `sharepoint_url`: SharePointドキュメントの直接URL
     - `parent_web_url`: SharePointサイトのベースURL
     - `last_modified`: 最終更新日時（ISO 8601形式）
     - `etag`: eTag（バージョン管理用）
     - `size`: ファイルサイズ（バイト）
     - `path`: Markdownファイルのパス
     - `mimeType`: ファイルのMIMEタイプ
   - その他の典型的なメタデータ:
     - `business_sub_category`: 業務小分類
     - `office`: アクセス可能な事業所コードの配列
     - `document_type`: ドキュメントタイプ（規程、ガイドライン、マニュアル等）
     - `file_path`: S3上のファイルパス
     - `version`, `last_updated`, `page_number`: その他のメタデータ

4. **レスポンスの`body`について**
   - Lambda関数は`body`をJSON文字列として返却
   - API Gatewayがこれを処理し、JSONオブジェクトとして返却
   - クライアントは直接JSONオブジェクトとしてアクセス可能（`response.session_id`など）
   - `metadata_list`の各要素は依然としてJSON文字列なので、個別にパースが必要

---

## レスポンスパターン

システムは4つのパターンでレスポンスを返します。

### パターン1: インデックスが存在しない場合

業務小分類に対応するインデックスが存在しない、または無効化されている場合。

**レスポンス構造:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "chat_history": [
    {
      "role": "user",
      "content": "施設管理について教えてください"
    },
    {
      "role": "assistant",
      "content": "頂いたご質問に関する情報については、回答できませんでした。なお、この質問につきましては、管理者により回答が差し控えられている可能性がございます。詳しくは、有人窓口へお問い合わせください。"
    }
  ],
  "business_sub_categories": ["施設管理", "安全衛生"],
  "priority_manned_counter_names": ["施設管理課", "安全衛生委員会"],
  "message": "頂いたご質問に関する情報については、回答できませんでした。なお、この質問につきましては、管理者により回答が差し控えられている可能性がございます。詳しくは、有人窓口へお問い合わせください。",
  "no_index_available": true
}
```

**このパターンの特徴:**

| フィールド           | 型        | 説明                                 |
| -------------------- | --------- | ------------------------------------ |
| `message`            | `string`  | 固定メッセージ                       |
| `no_index_available` | `boolean` | インデックス不在フラグ（常に`true`） |

---

### パターン2: FAQ回答のみ

FAQインデックスのみが有効で、検索結果がある場合。

**レスポンス構造:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "chat_history": [
    {
      "role": "user",
      "content": "パスワードリセットの方法を教えてください"
    },
    {
      "role": "assistant",
      "content": ""
    }
  ],
  "business_sub_categories": ["IT"],
  "priority_manned_counter_names": ["ITヘルプデスク"],
  "faq": {
    "answer": [
      "Q: パスワードリセットの方法は？\nA: パスワードリセットは社内ポータルの「アカウント設定」メニューから「パスワードリセット申請」を選択し、必要事項を入力して申請してください。申請後、ご登録のメールアドレスに確認メールが届きます。",
      "Q: VPN接続ができない場合は？\nA: まず、VPNクライアントが最新版か確認してください。それでも接続できない場合は、IT部門のナレッジベース（社内ポータル > IT > VPN接続トラブルシューティング）を参照するか、ITヘルプデスクまでお問い合わせください。"
    ],
    "source_files": ["IT-FAQ-パスワードリセット.md", "IT-FAQ-VPN接続.md"],
    "chunk_ids": [
      "MMC-it-faq-chunk-001-abcd1234",
      "MMC-it-faq-chunk-002-efgh5678"
    ],
    "source_texts": [
      "Q: パスワードリセットの方法は？\nA: パスワードリセットは社内ポータルの「アカウント設定」メニューから「パスワードリセット申請」を選択し、必要事項を入力して申請してください。申請後、ご登録のメールアドレスに確認メールが届きます。\n\n手順:\n1. 社内ポータルにログイン\n2. 「アカウント設定」メニューを開く\n3. 「パスワードリセット申請」を選択\n4. 必要事項を入力して送信",
      "Q: VPN接続ができない場合は？\nA: まず、VPNクライアントが最新版か確認してください。それでも接続できない場合は、IT部門のナレッジベース（社内ポータル > IT > VPN接続トラブルシューティング）を参照するか、ITヘルプデスクまでお問い合わせください。\n\nよくある原因:\n- VPNクライアントのバージョンが古い\n- 証明書の期限切れ\n- ネットワーク設定の問題"
    ],
    "metadata_list": [
      "{\"file_id\": \"01ABC12DEFG3HIJKLMNOPQRSTUVWXYZ123\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ/Shared%20Documents/IT/パスワードリセット.md\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ\", \"last_modified\": \"2025-12-01T09:15:00Z\", \"etag\": \"\\\"{D4E5F6A7-B8C9-0123-DEFG-234567890123}\\\"\", \"size\": 1048576, \"path\": \"markdown/MMC/IT/FAQ-パスワードリセット.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"text/markdown\", \"business_sub_category\": \"IT\", \"office\": [\"MM00\", \"MM01\", \"MM02\"], \"category\": \"FAQ\"}",
      "{\"file_id\": \"02BCD23EFGH4IJKLMNOPQRSTUVWXYZ234\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ/Shared%20Documents/IT/VPN接続.md\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ\", \"last_modified\": \"2025-11-28T14:30:00Z\", \"etag\": \"\\\"{E5F6A7B8-C9D0-1234-EFGH-345678901234}\\\"\", \"size\": 819200, \"path\": \"markdown/MMC/IT/FAQ-VPN接続.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"text/markdown\", \"business_sub_category\": \"IT\", \"office\": [\"MM00\", \"MM01\"], \"category\": \"FAQ\"}"
    ]
  }
}
```

**このパターンの特徴:**

- LLMによる回答生成なし（高速）
- `faq.answer`は配列形式で複数のFAQ項目を同時に返却可能
- 検索結果をそのまま返却（最大`top_n`件）
- `metadata_list`の各要素はJSON文字列（クライアント側でパースが必要）

---

### パターン3: RAG回答のみ

RAGインデックスのみが有効で、LLMが回答を生成した場合。

**レスポンス構造:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "chat_history": [
    {
      "role": "user",
      "content": "契約書の承認プロセスについて教えてください"
    },
    {
      "role": "assistant",
      "content": ""
    }
  ],
  "business_sub_categories": ["法務", "コンプライアンス"],
  "priority_manned_counter_names": ["法務相談窓口", "コンプライアンス窓口"],
  "rag": {
    "answer": "契約書の承認プロセスについてご説明します。まず、契約書は所属部門長の承認を得る必要があります。その後、法務部門によるリーガルチェックを受けてください。契約金額が1000万円を超える場合は、さらに経営会議での承認が必須となります。承認フローの詳細や期限については、法務部門（legal@example.com）までお問い合わせください。",
    "source_files": [
      "契約書承認規程_v2.3.pdf",
      "法務ガイドライン2025年版.docx",
      "コンプライアンスマニュアル.pdf"
    ],
    "chunk_ids": [
      "MMC-legal-rag-chunk-101-xyz789",
      "MMC-legal-rag-chunk-102-abc456",
      "MMC-compliance-rag-chunk-201-def123"
    ],
    "source_texts": [
      "第2章 契約書承認フロー\n\n2.1 承認プロセスの概要\n契約書は以下の手順で承認を得る必要があります。\n\n(1) 所属部門長による承認\n契約内容を確認し、部門長の承認を得てください。承認は電子承認システムを使用します。\n\n(2) 法務部門によるリーガルチェック\n部門長承認後、法務部門に送付し、法的観点からのチェックを受けます。通常3～5営業日を要します。\n\n(3) 最終承認\n法務チェック完了後、契約を締結できます。ただし、高額契約については別途経営会議での承認が必要です。",
      "第3章 高額契約の取扱い\n\n3.1 経営会議承認が必要な契約\n契約金額が1000万円を超える契約については、経営会議での承認が必須となります。経営会議は毎月第2・第4水曜日に開催されます。\n\n3.2 申請方法\n法務チェック完了後、経営企画部に経営会議への上程を依頼してください。上程には契約書原本、稟議書、コスト試算表が必要です。\n\n3.3 承認期間\n経営会議での承認には通常2～4週間を要します。余裕を持ったスケジュール設定をお願いします。",
      "第5章 お問い合わせ先\n\n5.1 法務部門連絡先\n契約書の承認プロセスや法的問題については、法務部までお問い合わせください。\n\n連絡先:\nメール: legal@example.com\n内線: 1234\n受付時間: 平日 9:00-17:00\n\n5.2 よくある質問\nQ: 承認にかかる期間は？\nA: 通常案件で1～2週間、高額契約で3～6週間です。\n\nQ: 急ぎの案件の場合は？\nA: 事前に法務部に相談してください。優先対応が可能な場合があります。"
    ],
    "metadata_list": [
      "{\"file_id\": \"01CDE34FGHI5JKLMNOPQRSTUVWXYZ345\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs/Shared%20Documents/法務/契約書承認規程_v2.3.pdf\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs\", \"last_modified\": \"2025-10-15T11:20:00Z\", \"etag\": \"\\\"{F6A7B8C9-D0E1-2345-FGHI-456789012345}\\\"\", \"size\": 3145728, \"path\": \"markdown/MMC/法務/契約書承認規程_v2.3.pdf.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/pdf\", \"business_sub_category\": \"法務\", \"office\": [\"MM00\", \"MM01\", \"MM02\"], \"document_type\": \"規程\", \"version\": \"2.3\", \"page_number\": 5}",
      "{\"file_id\": \"02DEF45GHIJ6KLMNOPQRSTUVWXYZ456\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs/Shared%20Documents/法務/法務ガイドライン2025年版.docx\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs\", \"last_modified\": \"2025-01-10T16:45:00Z\", \"etag\": \"\\\"{A7B8C9D0-E1F2-3456-GHIJ-567890123456}\\\"\", \"size\": 2621440, \"path\": \"markdown/MMC/法務/法務ガイドライン2025年版.docx.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/vnd.openxmlformats-officedocument.wordprocessingml.document\", \"business_sub_category\": \"法務\", \"office\": [\"MM00\"], \"document_type\": \"ガイドライン\", \"version\": \"2025\", \"page_number\": 12}",
      "{\"file_id\": \"03EFG56HIJK7LMNOPQRSTUVWXYZ567\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs/Shared%20Documents/コンプライアンス/コンプライアンスマニュアル.pdf\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs\", \"last_modified\": \"2025-09-20T13:00:00Z\", \"etag\": \"\\\"{B8C9D0E1-F2A3-4567-HIJK-678901234567}\\\"\", \"size\": 4194304, \"path\": \"markdown/MMC/コンプライアンス/コンプライアンスマニュアル.pdf.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/pdf\", \"business_sub_category\": \"コンプライアンス\", \"office\": [\"MM00\", \"MM01\"], \"document_type\": \"マニュアル\", \"page_number\": 23}"
    ]
  }
}
```

**このパターンの特徴:**

- LLMが複数ドキュメントを統合して自然な文章を生成
- `rag.answer`は文字列形式で1つの統合された回答を返却
- 非構造化ドキュメントから情報を抽出して回答を生成
- 文脈を考慮した回答
- `metadata_list`の各要素はJSON文字列（クライアント側でパースが必要）

---

### パターン4: FAQ回答とRAG回答の両方

FAQとRAGの両方が有効で、両方の結果がある場合。

**レスポンス構造** （簡略版、詳細は上記パターン2と3を参照）:

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "chat_history": [...],
  "business_sub_categories": ["営業", "マーケティング"],
  "priority_manned_counter_names": [...],
  "faq": {
    "answer": [
      "顧客情報の登録はCRMシステムから行います。",
      "見積書のテンプレートは営業ポータルからダウンロードできます。"
    ],
    "source_files": ["FAQ-SALES-001.md", "FAQ-SALES-002.md"],
    "chunk_ids": ["chunk_faq_sales_001", "chunk_faq_sales_002"],
    "source_texts": [
      "Q: 顧客情報の登録はどこから行いますか？\nA: 顧客情報の登録はCRMシステムから行います。社内ポータルにログイン後、「営業」メニューから「CRMシステム」を選択し、「新規顧客登録」ボタンをクリックしてください。\n\n登録手順:\n1. 社内ポータル > 営業 > CRMシステム\n2. 「新規顧客登録」ボタンをクリック\n3. 必須項目（会社名、担当者名、連絡先等）を入力\n4. 「登録」ボタンをクリック",
      "Q: 見積書のテンプレートはどこにありますか？\nA: 見積書のテンプレートは営業ポータルからダウンロードできます。営業ポータルにログイン後、「テンプレート」メニューから「見積書」を選択してください。\n\nダウンロード手順:\n1. 営業ポータルにログイン\n2. 「テンプレート」メニューを開く\n3. 「見積書」を選択\n4. 必要なテンプレートをダウンロード\n\n注意: テンプレートは最新版を使用してください。"
    ],
    "metadata_list": [
      "{\"file_id\": \"04FGH67IJKL8MNOPQRSTUVWXYZ678\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ/Shared%20Documents/営業/顧客登録FAQ.md\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ\", \"last_modified\": \"2025-11-15T10:30:00Z\", \"etag\": \"\\\"{C9D0E1F2-A3B4-5678-IJKL-789012345678}\\\"\", \"size\": 655360, \"path\": \"markdown/MMC/営業/FAQ-SALES-001.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"text/markdown\", \"business_sub_category\": \"営業\", \"office\": [\"MM00\", \"MM01\", \"MM02\"], \"category\": \"FAQ\"}",
      "{\"file_id\": \"05GHI78JKLM9NOPQRSTUVWXYZ789\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ/Shared%20Documents/営業/見積書テンプレートFAQ.md\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ\", \"last_modified\": \"2025-11-10T14:15:00Z\", \"etag\": \"\\\"{D0E1F2A3-B4C5-6789-JKLM-890123456789}\\\"\", \"size\": 524288, \"path\": \"markdown/MMC/営業/FAQ-SALES-002.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"text/markdown\", \"business_sub_category\": \"営業\", \"office\": [\"MM00\", \"MM01\"], \"category\": \"FAQ\"}"
    ]
  },
  "rag": {
    "answer": "顧客情報の登録は、CRMシステムの「新規顧客登録」メニューから行います。必須項目として会社名、担当者名、連絡先を入力し、営業担当者を割り当ててください。見積書は営業ポータルのテンプレートを使用し、承認フローに従って提出してください。",
    "source_files": ["crm_manual.pdf", "sales_operations_guide.docx"],
    "chunk_ids": ["chunk_rag_sales_101", "chunk_rag_sales_102"],
    "source_texts": [
      "CRMマニュアル 第2章 顧客管理\n\n2.1 新規顧客登録\nCRMシステムで新規顧客を登録する際は、以下の手順に従ってください。\n\n(1) 新規顧客登録画面の表示\n社内ポータルから「営業」>「CRMシステム」を選択し、「新規顧客登録」ボタンをクリックします。\n\n(2) 必須項目の入力\n以下の項目は必須入力です:\n- 会社名（正式名称）\n- 担当者名\n- 連絡先（電話番号、メールアドレス）\n- 業種\n- 営業担当者（自動的に自分が設定されますが、変更可能）\n\n(3) 任意項目の入力\n必要に応じて以下の情報も入力してください:\n- 住所\n- 資本金\n- 従業員数\n- 取引開始希望日",
      "営業業務ガイドライン 第5章 見積書作成\n\n5.1 見積書テンプレートの使用\n見積書を作成する際は、必ず営業ポータルの最新テンプレートを使用してください。\n\n5.2 見積書作成手順\n(1) 営業ポータルにログインし、「テンプレート」メニューから「見積書」を選択\n(2) 顧客情報をCRMシステムから自動取得\n(3) 商品・サービス情報を入力\n(4) 金額・納期を入力\n(5) 承認フローに従って提出\n\n5.3 承認フロー\n見積書は以下の承認を経て顧客に提出します:\n- 100万円未満: 課長承認\n- 100万円以上500万円未満: 部長承認\n- 500万円以上: 役員承認"
    ],
    "metadata_list": [
      "{\"file_id\": \"06HIJ89KLMN0OPQRSTUVWXYZ890\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs/Shared%20Documents/営業/CRMマニュアル.pdf\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs\", \"last_modified\": \"2025-10-20T09:00:00Z\", \"etag\": \"\\\"{E1F2A3B4-C5D6-7890-KLMN-901234567890}\\\"\", \"size\": 2097152, \"path\": \"markdown/MMC/営業/CRMマニュアル.pdf.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/pdf\", \"business_sub_category\": \"営業\", \"office\": [\"MM00\", \"MM01\", \"MM02\"], \"document_type\": \"マニュアル\", \"page_number\": 8}",
      "{\"file_id\": \"07IJK90LMNO1PQRSTUVWXYZ901\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs/Shared%20Documents/営業/営業業務ガイドライン.docx\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs\", \"last_modified\": \"2025-09-15T15:30:00Z\", \"etag\": \"\\\"{F2A3B4C5-D6E7-8901-LMNO-012345678901}\\\"\", \"size\": 1572864, \"path\": \"markdown/MMC/営業/営業業務ガイドライン.docx.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/vnd.openxmlformats-officedocument.wordprocessingml.document\", \"business_sub_category\": \"営業\", \"office\": [\"MM00\"], \"document_type\": \"ガイドライン\", \"page_number\": 15}"
    ]
  }
}
```

**このパターンの特徴:**

- FAQとRAGの両方の回答を1回のリクエストで取得
- FAQは配列形式（複数項目）、RAGは文字列形式（統合回答）
- フロントエンドで用途に応じた表示が可能（FAQ: 箇条書き、RAG: 詳細説明）
- より包括的な情報提供

---

## エラーレスポンス

### エラーレスポンス構造

```json
{
  "statusCode": <HTTP_STATUS_CODE>,
  "body": {
    "error": "<エラーメッセージ>"
  }
}
```

### エラーコード一覧

| HTTPステータス | エラーコード            | 発生条件                       | メッセージ例                                                                               |
| -------------- | ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ |
| `400`          | `BAD_REQUEST`           | リクエストボディが不正         | `"リクエストした body の形式が正しくありません"`                                           |
| `400`          | `BAD_REQUEST`           | パラメータバリデーションエラー | `"リクエストパラメータのバリデーションエラー: ..."`                                        |
| `400`          | `BAD_REQUEST`           | 必須パラメータ不足             | `"body に必要なキーが不足しています"`                                                      |
| `404`          | `NOT_FOUND`             | 検索結果なし                   | `"FAQ、RAGともに検索結果が見つかりませんでした"`                                           |
| `500`          | `INTERNAL_SERVER_ERROR` | Lambda内部エラー               | `"Lambda のアプリケーションコード内でクラス初期化処理に失敗しました"`                      |
| `500`          | `INTERNAL_SERVER_ERROR` | 予期しないエラー               | `"RAG システムの Lambda 関数のアプリケーションコード実行時に予期せぬエラーが発生しました"` |

### エラーレスポンス例

#### バリデーションエラー

```json
{
  "statusCode": 400,
  "body": {
    "error": "リクエストパラメータのバリデーションエラー: [{'loc': ['query'], 'msg': 'field required', 'type': 'value_error.missing'}]"
  }
}
```

#### 検索結果なし

```json
{
  "statusCode": 404,
  "body": {
    "error": "FAQ、RAGともに検索結果が見つかりませんでした。"
  }
}
```

#### サーバーエラー

```json
{
  "statusCode": 500,
  "body": {
    "error": "RAG システムの Lambda 関数のアプリケーションコード実行時に予期せぬエラーが発生しました。エラー内容：..."
  }
}
```

---

## 処理フロー

```
【リクエスト受信】
    ↓
【パラメータバリデーション】
    ↓
【フェーズ1】業務小分類の特定
    ├─ cdx-kintone-business_sub_category インデックスを検索
    ├─ ハイブリッド検索（BM25 + ベクトル検索、RRF統合）
    ├─ リランキング実行（is_rerank=trueの場合）
    └─ metadata.business_sub_category を抽出（最大top_n件、重複排除）
    ↓
【フェーズ2】検索対象インデックスの決定
    ├─ DynamoDBから業務小分類ごとの設定情報を取得
    ├─ isFaq/isRag フラグを確認
    ├─ 会社コード用とalljpn用の2種類のインデックスを生成
    │   - 会社コード: {company}-{business_sub_category}-{faq|rag}
    │   - alljpn: alljpn-{business_sub_category}-{faq|rag}
    ├─ isOfficeAccessOnly フラグに基づいてoffice_filtering_flagを設定
    └─ 有人窓口情報を抽出（mannedCounterName等）
    ↓
【フェーズ3】インデックスの存在確認とフィルタリング
    ├─ Elasticsearchに実在するインデックスのみをフィルタリング
    ├─ 存在しないインデックスは警告ログを出力してスキップ
    └─ 存在するインデックスがない場合: no_index_available=true
    ↓
    ├─ インデックスなし → 固定メッセージ返却（パターン1）
    ↓
【フェーズ4】ドキュメント検索とリランキング
    ├─ FAQインデックス検索（存在する場合、faq_flow()で並列実行）
    │   ├─ ThreadPoolExecutorで複数インデックスを並列検索
    │   ├─ office_filtering_flag=trueの場合、metadata.officeでフィルタリング
    │   ├─ ハイブリッド検索（BM25 + ベクトル類似度、RRF統合）
    │   ├─ クエリ拡張実行（is_query_expansion=trueの場合）
    │   ├─ 全インデックスの結果をマージ
    │   ├─ リランキング実行（is_rerank=trueの場合）
    │   └─ FAQ回答: 検索結果をそのまま返却（LLM生成なし、最大top_n件）
    └─ RAGインデックス検索（存在する場合、spo_flow()で並列実行）
        ├─ ThreadPoolExecutorで複数インデックスを並列検索
        ├─ office_filtering_flag=trueの場合、metadata.officeでフィルタリング
        ├─ ハイブリッド検索（BM25 + ベクトル類似度、RRF統合）
        ├─ クエリ拡張実行（is_query_expansion=trueの場合）
        ├─ 全インデックスの結果をマージ
        ├─ リランキング実行（is_rerank=trueの場合）
        └─ RAG回答: LLMで自然な文章を生成（system_messageまたはconfigテンプレート使用）
    ↓
【フェーズ5】回答結果の整理
    ├─ FAQ結果: 検索結果をそのまま返却（パターン2）
    ├─ RAG結果: LLMで生成した回答を返却（パターン3）
    ├─ 両方存在: FAQ + RAG回答を両方返却（パターン4）
    ├─ Langfuseトレースの更新（metadata、usage tokens等）
    └─ インデックスが存在しない場合: 固定メッセージを返却（パターン1）
    ↓
【チャット履歴保存】
    ├─ DynamoDBに会話履歴を保存（session_id、query、response等）
    └─ 保存失敗時はSNS通知を送信するが、レスポンスは正常に返却
    ↓
【レスポンス返却】
```

---

## 使用例

### ケース1: 初回質問（セッションIDなし）

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/automated_answer" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "query": "有給休暇の申請方法を教えてください",
    "company": "MMC",
    "office": "MM00",
    "miam_id": "user@example.com",
    "language": "ja"
  }'
```

**レスポンス:**

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "chat_history": [
    {
      "role": "user",
      "content": "有給休暇の申請方法を教えてください"
    },
    {
      "role": "assistant",
      "content": "有給休暇の申請は、社内システムから申請フォームを提出してください..."
    }
  ],
  "business_sub_categories": ["人事"],
  "priority_manned_counter_names": ["人事窓口"],
  "rag": {
    "answer": "有給休暇の申請は、社内システムから申請フォームを提出してください。勤怠管理システムにログイン後、「休暇申請」メニューから「有給休暇」を選択し、取得希望日と理由を入力して提出してください。申請は取得希望日の3営業日前までに行う必要があります。上長の承認が必要ですので、余裕を持って申請することをお勧めします。",
    "source_files": ["人事ガイドライン2025年版.pdf"],
    "chunk_ids": ["08JKL01MNOP2QRSTUVWXYZ012"],
    "source_texts": [
      "人事ガイドライン 第3章 休暇制度\n\n3.1 有給休暇の申請\n有給休暇を取得する際は、以下の手順で申請してください。\n\n(1) 勤怠管理システムへのアクセス\n社内ポータルから「勤怠管理システム」にログインします。\n\n(2) 休暇申請\n「休暇申請」メニューから「有給休暇」を選択し、以下の情報を入力します:\n- 取得希望日（開始日・終了日）\n- 取得理由（任意）\n- 緊急連絡先（長期休暇の場合）\n\n(3) 申請期限\n原則として取得希望日の3営業日前までに申請してください。緊急の場合は当日申請も可能ですが、事前に上長に相談することをお勧めします。\n\n(4) 承認フロー\n申請後、直属の上長による承認が必要です。承認されると自動的にメール通知が届きます。"
    ],
    "metadata_list": [
      "{\"file_id\": \"08JKL01MNOP2QRSTUVWXYZ012\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs/Shared%20Documents/人事/人事ガイドライン2025年版.pdf\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs\", \"last_modified\": \"2025-12-01T10:00:00Z\", \"etag\": \"\\\"{A3B4C5D6-E7F8-9012-MNOP-123456789012}\\\"\", \"size\": 2621440, \"path\": \"markdown/MMC/人事/人事ガイドライン2025年版.pdf.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/pdf\", \"business_sub_category\": \"人事\", \"office\": [\"MM00\", \"MM01\", \"MM02\"], \"document_type\": \"ガイドライン\", \"version\": \"2025\", \"page_number\": 18}"
    ]
  }
}
```

---

### ケース2: 継続会話（セッションIDあり）

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/automated_answer" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "query": "締め切りはいつですか？",
    "company": "MMC",
    "office": "MM00",
    "miam_id": "user@example.com",
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "language": "ja"
  }'
```

**レスポンス:**

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "chat_history": [
    {
      "role": "user",
      "content": "有給休暇の申請方法を教えてください"
    },
    {
      "role": "assistant",
      "content": "有給休暇の申請は、社内システムから..."
    },
    {
      "role": "user",
      "content": "締め切りはいつですか？"
    },
    {
      "role": "assistant",
      "content": "有給休暇の申請締め切りは、取得希望日の3営業日前までです。"
    }
  ],
  "business_sub_categories": ["人事"],
  "priority_manned_counter_names": ["人事窓口"],
  "rag": {
    "answer": "有給休暇の申請締め切りは、取得希望日の3営業日前までです。ただし、緊急の場合は当日申請も可能ですが、必ず事前に直属の上長に連絡し、承諾を得てください。計画的な休暇取得のため、できるだけ早めの申請をお勧めします。",
    "source_files": ["人事ガイドライン2025年版.pdf"],
    "chunk_ids": ["09KLM12NOPQ3RSTUVWXYZ123"],
    "source_texts": [
      "人事ガイドライン 第3章 休暇制度\n\n3.2 申請期限と緊急時の対応\n\n申請期限について\n有給休暇の申請は、原則として取得希望日の3営業日前までに完了してください。これにより、業務の引き継ぎや調整を円滑に行うことができます。\n\n緊急時の対応\n体調不良など緊急の事情により当日申請が必要な場合は、以下の手順に従ってください:\n1. できるだけ早く直属の上長に電話またはメールで連絡\n2. 上長の承諾を得る\n3. 勤怠管理システムから当日申請を行う\n4. 後日、診断書等の証明書類を提出（病気の場合）\n\n計画的な休暇取得\n年次有給休暇は計画的に取得することが推奨されます。特に長期休暇（3日以上）の場合は、1ヶ月前を目安に申請することをお勧めします。"
    ],
    "metadata_list": [
      "{\"file_id\": \"09KLM12NOPQ3RSTUVWXYZ123\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs/Shared%20Documents/人事/人事ガイドライン2025年版.pdf\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs\", \"last_modified\": \"2025-12-01T10:00:00Z\", \"etag\": \"\\\"{B4C5D6E7-F8A9-0123-NOPQ-234567890123}\\\"\", \"size\": 2621440, \"path\": \"markdown/MMC/人事/人事ガイドライン2025年版.pdf.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/pdf\", \"business_sub_category\": \"人事\", \"office\": [\"MM00\", \"MM01\", \"MM02\"], \"document_type\": \"ガイドライン\", \"version\": \"2025\", \"page_number\": 19}"
    ]
  }
}
```

**ポイント:**

- `chat_history`に前回の会話が含まれる
- システムは文脈を理解して「締め切り」が「有給休暇の申請締め切り」であることを認識

---

### ケース3: FAQ + RAG の両方が返却される場合

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/automated_answer" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "query": "テレワークの申請方法を教えてください",
    "company": "MMC",
    "office": "MM00",
    "miam_id": "user@example.com",
    "language": "ja",
    "top_n": 3
  }'
```

**レスポンス:**

```json
{
  "session_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "chat_history": [...],
  "business_sub_categories": ["総務", "人事"],
  "priority_manned_counter_names": ["総務課", "人事総務窓口"],
  "faq": {
    "answer": [
      "テレワークの申請は勤怠システムから行います。",
      "申請は前日までに上長の承認を得る必要があります。",
      "緊急時は事後申請も可能です。"
    ],
    "source_files": ["FAQ-TELEWORK-001.md", "FAQ-TELEWORK-002.md", "FAQ-TELEWORK-003.md"],
    "chunk_ids": ["faq_telework_001", "faq_telework_002", "faq_telework_003"],
    "source_texts": [
      "Q: テレワークの申請はどこから行いますか？\nA: テレワークの申請は勤怠システムから行います。社内ポータルにログイン後、「勤怠管理」メニューから「テレワーク申請」を選択してください。\n\n申請手順:\n1. 社内ポータルにログイン\n2. 「勤怠管理」メニューを開く\n3. 「テレワーク申請」を選択\n4. テレワーク実施日と作業内容を入力\n5. 「申請」ボタンをクリック",
      "Q: テレワーク申請の期限はいつまでですか？\nA: テレワーク申請は、原則として実施日の前日までに上長の承認を得る必要があります。計画的なテレワーク実施のため、できるだけ早めの申請をお勧めします。\n\n注意事項:\n- 前日までの申請が原則\n- 上長の承認が必要\n- 承認後、自動的にメール通知が届きます",
      "Q: 緊急時のテレワーク申請は可能ですか？\nA: 緊急時は事後申請も可能です。ただし、必ず当日中に勤怠システムから申請を行い、上長の承認を得てください。\n\n緊急時の対応:\n1. テレワーク開始前に上長に電話またはメールで連絡\n2. 当日中に勤怠システムから申請\n3. 上長の承認を得る\n\n※頻繁な事後申請は避け、計画的なテレワーク実施を心がけてください。"
    ],
    "metadata_list": [
      "{\"file_id\": \"10LMN23OPQR4STUVWXYZ234\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ/Shared%20Documents/総務/テレワーク申請FAQ.md\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ\", \"last_modified\": \"2025-11-25T13:45:00Z\", \"etag\": \"\\\"{C5D6E7F8-A9B0-1234-OPQR-345678901234}\\\"\", \"size\": 491520, \"path\": \"markdown/MMC/総務/FAQ-TELEWORK-001.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"text/markdown\", \"business_sub_category\": \"総務\", \"office\": [\"MM00\", \"MM01\", \"MM02\"], \"category\": \"FAQ\"}",
      "{\"file_id\": \"11MNO34PQRS5TUVWXYZ345\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ/Shared%20Documents/総務/テレワーク期限FAQ.md\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ\", \"last_modified\": \"2025-11-20T11:30:00Z\", \"etag\": \"\\\"{D6E7F8A9-B0C1-2345-PQRS-456789012345}\\\"\", \"size\": 409600, \"path\": \"markdown/MMC/総務/FAQ-TELEWORK-002.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"text/markdown\", \"business_sub_category\": \"総務\", \"office\": [\"MM00\", \"MM01\"], \"category\": \"FAQ\"}",
      "{\"file_id\": \"12NOP45QRST6UVWXYZ456\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ/Shared%20Documents/総務/テレワーク緊急時FAQ.md\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-FAQ\", \"last_modified\": \"2025-11-18T16:00:00Z\", \"etag\": \"\\\"{E7F8A9B0-C1D2-3456-QRST-567890123456}\\\"\", \"size\": 368640, \"path\": \"markdown/MMC/総務/FAQ-TELEWORK-003.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"text/markdown\", \"business_sub_category\": \"総務\", \"office\": [\"MM00\"], \"category\": \"FAQ\"}"
    ]
  },
  "rag": {
    "answer": "テレワークの申請は、勤怠システムの「テレワーク申請」メニューから行います。原則として前日までに申請し、上長の承認を得る必要があります。緊急時やむを得ない場合は事後申請も認められますが、当日中に申請を完了してください。詳細は総務課にお問い合わせください。",
    "source_files": ["テレワーク規程2025年版.pdf", "勤怠管理マニュアル.docx", "人事ガイドライン2025年版.pdf"],
    "chunk_ids": ["rag_telework_101", "rag_telework_102", "rag_telework_103"],
    "source_texts": [
      "テレワーク規程 第2章 テレワークの申請と承認\n\n2.1 申請方法\nテレワークを実施する場合は、勤怠システムから以下の手順で申請してください。\n\n(1) 勤怠システムへのアクセス\n社内ポータルから「勤怠管理」にログインし、「テレワーク申請」メニューを選択します。\n\n(2) 申請内容の入力\n以下の情報を入力してください:\n- テレワーク実施日（開始日・終了日）\n- 作業場所（自宅、サテライトオフィス等）\n- 作業内容の概要\n- 緊急連絡先\n\n(3) 申請期限\n原則として実施日の前日17時までに申請を完了してください。前日が休日の場合は、その前の営業日までに申請してください。",
      "勤怠管理マニュアル 第4章 各種申請\n\n4.3 テレワーク申請の承認フロー\nテレワーク申請は以下の承認フローで処理されます。\n\n(1) 申請者による申請\n勤怠システムから必要事項を入力し、申請を提出します。\n\n(2) 直属上長による承認\n申請内容を確認し、承認または却下を判断します。承認された場合、申請者と人事部門に自動的にメール通知が送信されます。\n\n(3) 緊急時の事後申請\n体調不良や交通機関のトラブル等、緊急の事情によりテレワークが必要な場合は、以下の手順で対応してください:\n- テレワーク開始前に上長に連絡\n- 当日中に勤怠システムから申請\n- 上長の承認を得る",
      "人事ガイドライン 第7章 柔軟な働き方\n\n7.2 テレワークの推進\n当社では、ワークライフバランスの実現と生産性向上のため、テレワークを推進しています。\n\nテレワーク実施時の注意事項:\n- 計画的な申請を心がける（前日までの申請が原則）\n- セキュリティルールを遵守する\n- 定期的に上長と業務状況を共有する\n- 月間のテレワーク実施日数は所属部門の方針に従う\n\nお問い合わせ先:\n総務課テレワーク担当\nメール: soumu@example.com\n内線: 5678"
    ],
    "metadata_list": [
      "{\"file_id\": \"13OPQ56RSTU7VWXYZ567\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs/Shared%20Documents/総務/テレワーク規程2025年版.pdf\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs\", \"last_modified\": \"2025-10-30T14:00:00Z\", \"etag\": \"\\\"{F8A9B0C1-D2E3-4567-RSTU-678901234567}\\\"\", \"size\": 1835008, \"path\": \"markdown/MMC/総務/テレワーク規程2025年版.pdf.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/pdf\", \"business_sub_category\": \"総務\", \"office\": [\"MM00\", \"MM01\", \"MM02\"], \"document_type\": \"規程\", \"version\": \"2025\", \"page_number\": 5}",
      "{\"file_id\": \"14PQR67STUV8WXYZ678\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs/Shared%20Documents/総務/勤怠管理マニュアル.docx\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs\", \"last_modified\": \"2025-11-05T10:30:00Z\", \"etag\": \"\\\"{A9B0C1D2-E3F4-5678-STUV-789012345678}\\\"\", \"size\": 1310720, \"path\": \"markdown/MMC/総務/勤怠管理マニュアル.docx.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/vnd.openxmlformats-officedocument.wordprocessingml.document\", \"business_sub_category\": \"総務\", \"office\": [\"MM00\", \"MM01\"], \"document_type\": \"マニュアル\", \"page_number\": 22}",
      "{\"file_id\": \"15QRS78TUVW9XYZ789\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs/Shared%20Documents/人事/人事ガイドライン2025年版.pdf\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs\", \"last_modified\": \"2025-12-01T10:00:00Z\", \"etag\": \"\\\"{B0C1D2E3-F4A5-6789-TUVW-890123456789}\\\"\", \"size\": 2621440, \"path\": \"markdown/MMC/人事/人事ガイドライン2025年版.pdf.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/pdf\", \"business_sub_category\": \"人事\", \"office\": [\"MM00\", \"MM01\", \"MM02\"], \"document_type\": \"ガイドライン\", \"version\": \"2025\", \"page_number\": 45}"
    ]
  }
}
```

**ポイント:**

- FAQは構造化データとして3件の回答を返却
- RAGはLLMが複数ドキュメントを統合して自然な文章を生成
- フロントエンドでFAQを箇条書き表示、RAGを詳細説明として表示可能

---

### ケース4: インデックスが存在しない場合

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/automated_answer" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "query": "新規プロジェクトの予算申請について教えてください",
    "company": "MMC",
    "office": "MM00",
    "miam_id": "user@example.com",
    "language": "ja"
  }'
```

**レスポンス:**

```json
{
  "session_id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "chat_history": [
    {
      "role": "user",
      "content": "新規プロジェクトの予算申請について教えてください"
    },
    {
      "role": "assistant",
      "content": "頂いたご質問に関する情報については、回答できませんでした。なお、この質問につきましては、管理者により回答が差し控えられている可能性がございます。詳しくは、有人窓口へお問い合わせください。"
    }
  ],
  "business_sub_categories": ["経営企画"],
  "priority_manned_counter_names": ["経営企画部"],
  "message": "頂いたご質問に関する情報については、回答できませんでした。なお、この質問につきましては、管理者により回答が差し控えられている可能性がございます。詳しくは、有人窓口へお問い合わせください。",
  "no_index_available": true
}
```

**ポイント:**

- インデックスが存在しない、または管理者が無効化している場合
- 固定メッセージを返却（エラーではなく正常レスポンス）
- `no_index_available: true` で判定可能

---

### ケース5: 実際の本番レスポンス例（経費精算の期限について）

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/automated_answer" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "query": "経費精算の期限はいつですか？",
    "company": "MMC",
    "office": "MM00",
    "miam_id": "user@example.com"
  }'
```

**レスポンス:**

```json
{
  "session_id": "c1d652b9-3096-4c85-b631-682df5b7922a",
  "chat_history": [],
  "business_sub_categories": ["出張・旅費精算"],
  "priority_manned_counter_names": ["出張・旅費精算窓口"],
  "rag": {
    "answer": "経費精算の期限については、出張の種類によって異なりますが、一般的には以下の通りです。\n\n国内出張の場合、出張終了後速やかに精算手続きを行う必要があります。具体的には、出張完了月の翌月10日までに経理部へ提出することが原則となっています。\n\n海外出張の場合も、帰国後速やかに精算を行い、帰国月の翌月10日までに提出する必要があります。\n\nただし、やむを得ない事情で期限内に提出できない場合は、事前に経理部門に相談することをお勧めします。詳細な手続きや特殊なケースについては、出張・旅費精算窓口（maildealer-48@mds3059.maildealer.jp）までお問い合わせください。",
    "source_files": [
      "markdown/MMC/出張・旅費精算/国内出張精算マニュアル.pdf.md",
      "markdown/MMC/出張・旅費精算/海外出張マニュアル.pdf.md",
      "markdown/alljpn/出張・旅費精算/経費精算ガイドライン.pdf.md"
    ],
    "chunk_ids": [
      "0c20652762f4430fbc96aeafe64e8ba45ffbde9f35b635929ebe2c614a5e1198",
      "1d31763873e5541gcd07bfbgf75f9cb56ggcef0a46c746a03afcf3d725b6f2209",
      "2e42874984f6652hde18cgchg86g0dc67hhdfg1b57d857b14bgdg4e836c7g3310"
    ],
    "source_texts": [
      "出張旅費マニュアル\n\nいつから 精算できる？ → 出張終了後、速やかに\n\n精算期限について\n国内出張の精算は、出張完了月の翌月10日までに経理部へ提出してください。期限を過ぎた場合、承認が遅れる可能性があります。\n\n必要書類:\n- 出張精算書\n- 領収書原本\n- 出張報告書",
      "海外出張マニュアル 2025年版\n\n第3章 精算手続き\n\n3.1 精算期限\n海外出張の精算は、帰国後速やかに行ってください。原則として帰国月の翌月10日までに経理部門へ提出する必要があります。\n\n3.2 必要書類\n- 海外出張精算書\n- 航空券の領収書\n- ホテルの領収書\n- その他経費の領収書\n- パスポートのコピー（出入国スタンプページ）",
      "経費精算ガイドライン\n\n第5章 提出期限と承認フロー\n\n5.1 提出期限\n経費精算は、費用発生後速やかに処理してください。やむを得ない事情で期限内に提出できない場合は、事前に経理部門（keiri@example.com）に相談してください。\n\n5.2 期限超過の場合\n期限を超過した精算については、別途理由書の提出が必要となります。"
    ],
    "metadata_list": [
      "{\"file_id\": \"01UNH66NRXWNCIPGPKIBCYIJTXPXWCWYPF\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs/Shared%20Documents/出張・旅費精算/国内出張精算マニュアル.pdf\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs\", \"last_modified\": \"2025-11-20T08:30:00Z\", \"etag\": \"\\\"{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}\\\"\", \"size\": 2457600, \"path\": \"markdown/MMC/出張・旅費精算/国内出張精算マニュアル.pdf.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/pdf\"}",
      "{\"file_id\": \"02VNI77OSYXODKQHQLJCZJKUYPYXDXYZQG\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs/Shared%20Documents/出張・旅費精算/海外出張マニュアル.pdf\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/MMC-Docs\", \"last_modified\": \"2025-10-15T14:20:00Z\", \"etag\": \"\\\"{B2C3D4E5-F6A7-8901-BCDE-F12345678901}\\\"\", \"size\": 3145728, \"path\": \"markdown/MMC/出張・旅費精算/海外出張マニュアル.pdf.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/pdf\"}",
      "{\"file_id\": \"03WOJ88PTZYPELRIRLKDZKL VZQZYEZA0RH\", \"sharepoint_url\": \"https://murataglobal.sharepoint.com/sites/AllJPN-Docs/Shared%20Documents/出張・旅費精算/経費精算ガイドライン.pdf\", \"parent_web_url\": \"https://murataglobal.sharepoint.com/sites/AllJPN-Docs\", \"last_modified\": \"2025-09-30T10:00:00Z\", \"etag\": \"\\\"{C3D4E5F6-A7B8-9012-CDEF-123456789012}\\\"\", \"size\": 1835008, \"path\": \"markdown/alljpn/出張・旅費精算/経費精算ガイドライン.pdf.md\", \"activities\": \"[]\", \"file\": \"{}\", \"mimeType\": \"application/pdf\"}"
    ]
  }
}
```

**ポイント:**

- 実際の本番環境からのレスポンス例
- `business_sub_categories`で「出張・旅費精算」が正確に識別されている
- RAG回答は複数のドキュメント（国内出張、海外出張、経費精算ガイドライン）から統合された自然な文章
- `source_texts`には実際の日本語ドキュメントチャンクが含まれる
- `metadata_list`の各要素にはSharePointの詳細なメタデータが含まれる（file_id, sharepoint_url, last_modified等）
- 優先表示窓口名（priority_manned_counter_names）も併せて提供され、ユーザーは必要に応じて直接問い合わせ可能

---

## 注意事項

### セッション管理

- `session_id`を指定しない場合、毎回新しいセッションが開始されます
- 会話の文脈を維持するには、レスポンスの`session_id`を次回リクエストで使用してください
- セッションIDは UUIDv4 形式である必要があります

### 会話履歴

- 会話履歴はDynamoDBに自動保存されます（詳細は`docs/chat_history_table_schema.md`参照）
- 同じ`session_id`を使用すると、過去の会話が`chat_history`に含まれます
- チャット履歴は検索とリランキングで文脈理解に使用されます
- **保存形式:**
  - 会話1ラリー（1質問＋1回答）ごとに1レコードとして保存
  - FAQ回答とRAG回答が両方存在する場合、2レコード（FAQ用とRAG用）に分けて保存
  - リクエストパラメータの`miam_id`はDynamoDBに`miamId`として記録される
- **記録される情報:**
  - 基本情報: sessionId, conversationTime, chatHistory, company, office, miamId
  - 業務小分類関連: businessSubCategoryQueryExpansionModel, businessSubCategoryRetrievalMode, businessSubCategoryRetrievalModel, businessSubCategoryRerankModel, businessSubCategoryTopK, businessSubCategoryPredictions
  - 回答生成関連: answerMethod (rag/faq/""), answerQueryExpansionModel, answerRetrievalMode, answerRetrievalModel, answerRerankModel, answerTopK, answerModel, chunkIds
  - パフォーマンス: responseTime

### 業務小分類の自動識別

- `business_sub_categories`は自動的に識別されます（最大business_sub_category_top_n件）
- 識別プロセス:
  1. cdx-kintone-business_sub_category インデックスに対してハイブリッド検索を実行
  2. リランキングを適用（is_rerank=trueの場合）
  3. metadata.business_sub_category を抽出（重複排除、順序保持）
- 識別失敗時は空リスト`[]`が返却されますが、処理は継続されます
- 複数の業務分野にまたがる質問にも対応します
- 会話履歴（chat_history）を利用して文脈を考慮した識別を行います

### 有人窓口情報の取得

- `priority_manned_counter_names` は、特定された業務小分類に対応する有人窓口名のリストです
- このリストは `/v1/get_manned_counter` API の入力パラメータとして使用できます
- **使用例:**

  ```bash
  # 1. automated_answer APIで窓口名を取得
  RESPONSE=$(curl -X POST "https://your-api-endpoint/v1/automated_answer" \
    -H 'Content-Type: application/json' \
    -d '{"query": "経費精算について", "company": "MMC", "office": "MM00", "miam_id": "user@example.com"}')

  # 2. レスポンスから priority_manned_counter_names を抽出
  COUNTER_NAMES=$(echo $RESPONSE | jq -r '.priority_manned_counter_names')

  # 3. get_manned_counter APIで窓口の詳細情報を取得
  curl -X POST "https://your-api-endpoint/v1/get_manned_counter" \
    -H 'Content-Type: application/json' \
    -d "{
      \"priority_manned_counter_names\": $COUNTER_NAMES,
      \"company\": \"MMC\",
      \"office\": \"MM00\"
    }"
  ```

- 窓口の詳細情報（メールアドレス、説明、アクセス制限等）は `/v1/get_manned_counter` API から取得してください
