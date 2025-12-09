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

| パラメータ     | 型       | 説明                            | 例                               |
| -------------- | -------- | ------------------------------- | -------------------------------- |
| `query`        | `string` | ユーザーの質問内容（1文字以上） | `"経費精算の期限はいつですか？"` |
| `company_code` | `string` | 会社コード                      | `"MMC"`                          |
| `office_code`  | `string` | 事業所コード                    | `"MM00"`                         |

#### オプションパラメータ

| パラメータ       | 型        | デフォルト値     | 説明                               | 制約                                         |
| ---------------- | --------- | ---------------- | ---------------------------------- | -------------------------------------------- |
| `session_id`     | `string?` | 自動生成         | セッション識別子（会話履歴管理用） | UUIDv4形式                                   |
| `model_name`     | `string`  | `"gpt-4.1-mini"` | 使用するLLMモデル                  | Azure OpenAIモデル名                         |
| `language`       | `string`  | `"default"`      | 入力言語                           | ISO639-1 (`"ja"`, `"en"`) または `"default"` |
| `retrieval_mode` | `string`  | `"hybrid"`       | 検索モード                         | `"hybrid"` / `"bm25"` / `"cos_sim"`          |
| `top_n`          | `integer` | `5`              | 返却するドキュメント数             | 1～100                                       |
| `system_message` | `string?` | `null`           | カスタムシステムメッセージ         | 「質問」「ソース」を含む必要あり             |
| `llm_params`     | `object`  | 下記参照         | LLMパラメータ                      | -                                            |

**注意:** 以下のパラメータは現在実装で固定値として設定されており、リクエストパラメータとして指定しても無視されます:

- `rrf_k`: 固定値 `5`
- `is_query_expansion`: 固定値 `false`
- `rerank_model_type`: 固定値 `"aoai"`
- `bedrock_model_name`: 固定値 `"amazon.rerank-v1:0"`

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

---

## リクエスト例

### 最小構成（必須パラメータのみ）

```json
{
  "query": "経費精算の期限はいつですか？",
  "company_code": "MMC",
  "office_code": "MM00"
}
```

### 推奨構成

```json
{
  "query": "経費精算の期限はいつですか？",
  "company_code": "MMC",
  "office_code": "MM00",
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
  "company_code": "MMC",
  "office_code": "MM00",
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "model_name": "gpt-4.1-mini",
  "language": "ja",
  "retrieval_mode": "hybrid",
  "top_n": 5,
  "rrf_k": 5,
  "is_query_expansion": false,
  "rerank_model_type": "aoai",
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
    "company_code": "mmc",
    "office_code": "mm00"
  }'
```

#### オプションパラメータを含むリクエスト

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/automated_answer" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "query": "経費精算の期限はいつですか？",
    "company_code": "mmc",
    "office_code": "mm00",
    "language": "ja",
    "retrieval_mode": "hybrid",
    "top_n": 5
  }'
```

---

## 出力仕様

### 成功レスポンス

#### ステータスコード: `200 OK`

```json
{
  "statusCode": 200,
  "body": {
    // レスポンスボディ（JSON文字列）
  }
}
```

### レスポンスボディの共通フィールド

| フィールド                | 型              | 説明                                                   |
| ------------------------- | --------------- | ------------------------------------------------------ |
| `session_id`              | `string`        | セッションID（UUIDv4形式）                             |
| `chat_history`            | `array`         | 対話履歴（質問・回答のペア）                           |
| `business_sub_categories` | `array<string>` | 特定された業務小分類リスト（最大5件）                  |
| `manned_counter_info`     | `array<object>` | 有人窓口情報のリスト（各業務小分類に対応する窓口情報） |

#### 有人窓口情報の構造

```json
{
  "manned_counter_info": [
    {
      "business_sub_category": "人事",
      "manned_counter_name": "人事総務窓口",
      "manned_counter_email": "jinji@example.com",
      "manned_counter_description": "人事・採用に関するお問い合わせ",
      "is_office_access_only": false
    },
    {
      "business_sub_category": "IT",
      "manned_counter_name": "ITヘルプデスク",
      "manned_counter_email": "helpdesk@example.com",
      "manned_counter_description": "システム・ネットワークに関するお問い合わせ",
      "is_office_access_only": true
    }
  ]
}
```

| フィールド                   | 型         | 説明                                                                                       |
| ---------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| `business_sub_category`      | `string`   | 業務小分類名                                                                               |
| `manned_counter_name`        | `string?`  | 有人窓口の名称（任意）                                                                     |
| `manned_counter_email`       | `string?`  | 有人窓口のメールアドレス（任意）                                                           |
| `manned_counter_description` | `string?`  | 有人窓口の説明文（任意）                                                                   |
| `is_office_access_only`      | `boolean?` | 事業所アクセス制限フラグ（任意）。`true`の場合、該当業務小分類は特定事業所のみアクセス可能 |

#### チャット履歴の構造

```json
{
  "chat_history": [
    {
      "role": "user",
      "content": "前回の質問内容"
    },
    {
      "role": "assistant",
      "content": "前回の回答内容"
    },
    {
      "role": "user",
      "content": "今回の質問内容"
    },
    {
      "role": "assistant",
      "content": "今回の回答内容"
    }
  ]
}
```

---

## レスポンスパターン

システムは4つのパターンでレスポンスを返します。

### パターン1: インデックスが存在しない場合

業務小分類に対応するインデックスが存在しない、または無効化されている場合。

```json
{
  "statusCode": 200,
  "body": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "chat_history": [...],
    "business_sub_categories": ["施設管理", "安全衛生"],
    "manned_counter_info": [
      {
        "business_sub_category": "施設管理",
        "manned_counter_name": "施設管理課",
        "manned_counter_email": "facility@example.com",
        "manned_counter_description": "施設・設備に関するお問い合わせ",
        "is_office_access_only": true
      },
      {
        "business_sub_category": "安全衛生",
        "manned_counter_name": "安全衛生委員会",
        "manned_counter_email": "safety@example.com",
        "manned_counter_description": "安全衛生に関するお問い合わせ",
        "is_office_access_only": false
      }
    ],
    "message": "頂いたご質問に関する情報については、回答できませんでした。なお、この質問につきましては、管理者により回答が差し控えられている可能性がございます。詳しくは、有人窓口へお問い合わせください。",
    "no_index_available": true
  }
}
```

**追加フィールド:**

| フィールド           | 型        | 説明                                 |
| -------------------- | --------- | ------------------------------------ |
| `message`            | `string`  | 固定メッセージ                       |
| `no_index_available` | `boolean` | インデックス不在フラグ（常に`true`） |

---

### パターン2: FAQ回答のみ

FAQインデックスのみが有効で、検索結果がある場合。

```json
{
  "statusCode": 200,
  "body": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "chat_history": [...],
    "business_sub_categories": ["IT"],
    "manned_counter_info": [
      {
        "business_sub_category": "IT",
        "manned_counter_name": "ITヘルプデスク",
        "manned_counter_email": "helpdesk@example.com",
        "manned_counter_description": "システム・ネットワークに関するお問い合わせ",
        "is_office_access_only": false
      }
    ],
    "faq": {
      "answer": [
        "パスワードリセットは社内ポータルから申請できます。",
        "VPN接続の手順はIT部門のナレッジベースを参照してください。"
      ],
      "source_files": [
        "FAQ-IT-001.md",
        "FAQ-IT-002.md"
      ],
      "chunk_ids": [
        "chunk_it_001",
        "chunk_it_002"
      ],
      "source_texts": [
        "Q: パスワードリセットの方法は？\nA: パスワードリセットは社内ポータルから申請できます...",
        "Q: VPN接続方法は？\nA: VPN接続の手順はIT部門のナレッジベースを参照してください..."
      ],
      "metadata_list": [
        "{\"business_sub_category\": \"IT\", \"office_codes\": [\"all\"]}",
        "{\"business_sub_category\": \"IT\", \"office_codes\": [\"all\"]}"
      ]
    }
  }
}
```

**FAQフィールド:**

| フィールド          | 型              | 説明                                                   |
| ------------------- | --------------- | ------------------------------------------------------ |
| `faq`               | `object`        | FAQ結果を含む辞書オブジェクト                          |
| `faq.answer`        | `array<string>` | FAQ回答リスト（検索結果をそのまま返却、最大`top_n`件） |
| `faq.source_files`  | `array<string>` | FAQソースファイル名リスト                              |
| `faq.chunk_ids`     | `array<string>` | FAQチャンクIDリスト                                    |
| `faq.source_texts`  | `array<string>` | FAQ参照チャンクのテキストリスト                        |
| `faq.metadata_list` | `array<string>` | FAQ参照チャンクのメタデータリスト（JSON文字列）        |

**特徴:**

- LLMによる回答生成なし（高速）
- 複数のFAQ項目を同時に返却可能
- 構造化データとして返却

---

### パターン3: RAG回答のみ

RAGインデックスのみが有効で、LLMが回答を生成した場合。

```json
{
  "statusCode": 200,
  "body": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "chat_history": [...],
    "business_sub_categories": ["法務", "コンプライアンス"],
    "manned_counter_info": [
      {
        "business_sub_category": "法務",
        "manned_counter_name": "法務相談窓口",
        "manned_counter_email": "legal@example.com",
        "manned_counter_description": "契約・法務に関するお問い合わせ",
        "is_office_access_only": true
      },
      {
        "business_sub_category": "コンプライアンス",
        "manned_counter_name": "コンプライアンス窓口",
        "manned_counter_email": "compliance@example.com",
        "manned_counter_description": "コンプライアンスに関するお問い合わせ",
        "is_office_access_only": false
      }
    ],
    "rag": {
      "answer": "契約書の承認プロセスは、まず所属部門長の承認を得た後、法務部門によるリーガルチェックを受ける必要があります。金額が1000万円を超える場合は、さらに経営会議での承認が必要となります。詳細は法務部門にお問い合わせください。",
      "source_files": [
        "contract_approval_process.pdf",
        "legal_guidelines.docx",
        "compliance_manual.pdf"
      ],
      "chunk_ids": [
        "chunk_legal_101",
        "chunk_legal_102",
        "chunk_legal_103"
      ],
      "source_texts": [
        "第2章 契約書承認フロー\n2.1 承認プロセス\n契約書は所属部門長の承認後、法務部門によるリーガルチェックが必要です...",
        "高額契約の取扱い\n1000万円を超える契約については経営会議での承認が必須となります...",
        "法務部問い合わせ先\n法務部: legal@example.com..."
      ],
      "metadata_list": [
        "{\"business_sub_category\": \"法務\", \"document_type\": \"規程\"}",
        "{\"business_sub_category\": \"法務\", \"document_type\": \"ガイドライン\"}",
        "{\"business_sub_category\": \"コンプライアンス\", \"document_type\": \"マニュアル\"}"
      ]
    }
  }
}
```

**RAGフィールド:**

| フィールド          | 型              | 説明                                                           |
| ------------------- | --------------- | -------------------------------------------------------------- |
| `rag`               | `object`        | RAG結果を含む辞書オブジェクト                                  |
| `rag.answer`        | `string`        | LLMが生成した自然な回答文                                      |
| `rag.source_files`  | `array<string>` | RAGソースファイル名リスト（最大`top_n`件）                     |
| `rag.chunk_ids`     | `array<string>` | RAGチャンクIDリスト（最大`top_n`件）                           |
| `rag.source_texts`  | `array<string>` | RAG参照チャンクのテキストリスト（最大`top_n`件）               |
| `rag.metadata_list` | `array<string>` | RAG参照チャンクのメタデータリスト（JSON文字列、最大`top_n`件） |

**特徴:**

- LLMが複数ドキュメントを統合して自然な文章を生成
- 非構造化ドキュメントから回答を抽出
- 文脈を考慮した回答

---

### パターン4: FAQ回答とRAG回答の両方

FAQとRAGの両方が有効で、両方の結果がある場合。

```json
{
  "statusCode": 200,
  "body": {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "chat_history": [...],
    "business_sub_categories": ["営業", "マーケティング"],
    "manned_counter_info": [
      {
        "business_sub_category": "営業",
        "manned_counter_name": "営業支援窓口",
        "manned_counter_email": "sales-support@example.com",
        "manned_counter_description": "営業活動に関するお問い合わせ",
        "is_office_access_only": false
      },
      {
        "business_sub_category": "マーケティング",
        "manned_counter_name": "マーケティング部",
        "manned_counter_email": "marketing@example.com",
        "manned_counter_description": "マーケティング施策に関するお問い合わせ",
        "is_office_access_only": true
      }
    ],

    // FAQ結果
    "faq": {
      "answer": [
        "顧客情報の登録はCRMシステムから行います。",
        "見積書のテンプレートは営業ポータルからダウンロードできます。"
      ],
      "source_files": ["FAQ-SALES-001.md", "FAQ-SALES-002.md"],
      "chunk_ids": ["chunk_faq_sales_001", "chunk_faq_sales_002"],
      "source_texts": [...],
      "metadata_list": [...]
    },

    // RAG結果
    "rag": {
      "answer": "顧客情報の登録は、CRMシステムの「新規顧客登録」メニューから行います。必須項目として会社名、担当者名、連絡先を入力し、営業担当者を割り当ててください。見積書は営業ポータルのテンプレートを使用し、承認フローに従って提出してください。",
      "source_files": ["crm_manual.pdf", "sales_operations_guide.docx"],
      "chunk_ids": ["chunk_rag_sales_101", "chunk_rag_sales_102"],
      "source_texts": [...],
      "metadata_list": [...]
    }
  }
}
```

**特徴:**

- FAQとRAGの両方の回答を1回のリクエストで取得
- フロントエンドで用途に応じた表示が可能
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
    ├─ ハイブリッド検索 + リランキング
    └─ business_sub_categories を抽出（最大5件）
    ↓
【フェーズ2】検索対象インデックスの決定
    ├─ DynamoDBから業務小分類の設定を取得
    ├─ isFaq/isRag フラグを確認
    ├─ FAQ/RAGインデックスリストを生成
    └─ メタデータフィルタ（office_code）を設定
    ↓
【フェーズ3】インデックスの存在確認
    ├─ Elasticsearchで実在確認
    └─ 存在しないインデックスを除外
    ↓
    ├─ インデックスなし → 固定メッセージ返却（パターン1）
    ↓
【フェーズ4】ドキュメント検索とリランキング
    ├─ FAQインデックス検索（存在する場合）
    │   ├─ ハイブリッド検索
    │   └─ リランキング
    └─ RAGインデックス検索（存在する場合）
        ├─ ハイブリッド検索
        └─ リランキング
    ↓
【フェーズ5】回答生成
    ├─ FAQ → 検索結果をそのまま返却（パターン2）
    ├─ RAG → LLMで自然な文章を生成（パターン3）
    └─ 両方 → FAQ + RAG回答を両方返却（パターン4）
    ↓
【チャット履歴保存】
    └─ DynamoDBに会話履歴を保存
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
    "company_code": "mmc",
    "office_code": "mm00",
    "language": "ja"
  }'
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
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
    "manned_counter_info": [
      {
        "business_sub_category": "人事",
        "manned_counter_name": "人事窓口",
        "manned_counter_email": "jinji@example.com",
        "manned_counter_description": "人事に関するお問い合わせ",
        "is_office_access_only": false
      }
    ],
    "rag": {
      "answer": "有給休暇の申請は、社内システムから申請フォームを提出してください...",
      "source_files": ["hr_guide.pdf"],
      "chunk_ids": ["chunk_001"],
      "source_texts": ["有給休暇の申請手順\n1. 社内システムにログイン\n2. ..."],
      "metadata_list": ["{\"business_sub_category\": \"人事\"}"]
    }
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
    "company_code": "mmc",
    "office_code": "mm00",
    "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "language": "ja"
  }'
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
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
    "manned_counter_info": [
      {
        "business_sub_category": "人事",
        "manned_counter_name": "人事窓口",
        "manned_counter_email": "jinji@example.com",
        "manned_counter_description": "人事に関するお問い合わせ",
        "is_office_access_only": false
      }
    ],
    "rag": {
      "answer": "有給休暇の申請締め切りは、取得希望日の3営業日前までです。",
      "source_files": ["hr_guide.pdf"],
      "chunk_ids": ["chunk_002"],
      "source_texts": [
        "申請締め切り\n有給休暇は取得希望日の3営業日前までに..."
      ],
      "metadata_list": ["{\"business_sub_category\": \"人事\"}"]
    }
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
    "company_code": "mmc",
    "office_code": "mm00",
    "language": "ja",
    "top_n": 3
  }'
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
    "session_id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "chat_history": [...],
    "business_sub_categories": ["総務", "人事"],
    "manned_counter_info": [
      {
        "business_sub_category": "総務",
        "manned_counter_name": "総務課",
        "manned_counter_email": "soumu@example.com",
        "manned_counter_description": "総務全般に関するお問い合わせ",
        "is_office_access_only": false
      },
      {
        "business_sub_category": "人事",
        "manned_counter_name": "人事総務窓口",
        "manned_counter_email": "jinji@example.com",
        "manned_counter_description": "人事・労務に関するお問い合わせ",
        "is_office_access_only": true
      }
    ],

    "faq": {
      "answer": [
        "テレワークの申請は勤怠システムから行います。",
        "申請は前日までに上長の承認を得る必要があります。",
        "緊急時は事後申請も可能です。"
      ],
      "source_files": ["FAQ-TELEWORK-001.md", "FAQ-TELEWORK-002.md", "FAQ-TELEWORK-003.md"],
      "chunk_ids": ["faq_telework_001", "faq_telework_002", "faq_telework_003"],
      "source_texts": [...],
      "metadata_list": [...]
    },

    "rag": {
      "answer": "テレワークの申請は、勤怠システムの「テレワーク申請」メニューから行います。原則として前日までに申請し、上長の承認を得る必要があります。緊急時やむを得ない場合は事後申請も認められますが、当日中に申請を完了してください。詳細は総務課にお問い合わせください。",
      "source_files": ["telework_policy.pdf", "attendance_manual.docx", "hr_guidelines.pdf"],
      "chunk_ids": ["rag_telework_101", "rag_telework_102", "rag_telework_103"],
      "source_texts": [...],
      "metadata_list": [...]
    }
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
    "company_code": "mmc",
    "office_code": "mm00",
    "language": "ja"
  }'
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
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
    "manned_counter_info": [
      {
        "business_sub_category": "経営企画",
        "manned_counter_name": "経営企画部",
        "manned_counter_email": "planning@example.com",
        "manned_counter_description": "経営企画・予算に関するお問い合わせ",
        "is_office_access_only": true
      }
    ],
    "message": "頂いたご質問に関する情報については、回答できませんでした。なお、この質問につきましては、管理者により回答が差し控えられている可能性がございます。詳しくは、有人窓口へお問い合わせください。",
    "no_index_available": true
  }
}
```

**ポイント:**

- インデックスが存在しない、または管理者が無効化している場合
- 固定メッセージを返却（エラーではなく正常レスポンス）
- `no_index_available: true` で判定可能

---

## 注意事項

### セッション管理

- `session_id`を指定しない場合、毎回新しいセッションが開始されます
- 会話の文脈を維持するには、レスポンスの`session_id`を次回リクエストで使用してください
- セッションIDは UUIDv4 形式である必要があります

### 会話履歴

- 会話履歴はDynamoDBに自動保存されます
- 同じ`session_id`を使用すると、過去の会話が`chat_history`に含まれます
- チャット履歴は検索とリランキングで文脈理解に使用されます

### 業務小分類の自動識別

- `business_sub_categories`は自動的に識別されます（最大5件）
- 識別失敗時は空リスト`[]`が返却されますが、処理は継続されます
- 複数の業務分野にまたがる質問にも対応します

### 検索対象インデックス

- 業務小分類に基づき、DynamoDBから動的に決定されます
- `isFaq`/`isRag`フラグで各インデックスの有効/無効を制御
- 会社コード・事業所コードに応じたインデックスが自動選択されます

### エラーハンドリング

- エラー発生時はSNS通知が送信されます（管理者向け）
- チャット履歴保存失敗時も、ユーザーには回答が返却されます
- 予期しないエラーは全てログに記録されます

### パフォーマンス

- ハイブリッド検索は高精度ですが、レイテンシが増加します
- `bm25`モードは高速ですが、セマンティック検索は行われません
- `top_n`を小さくするとレスポンスが高速になります

---

## 技術仕様

### 使用技術

- **言語:** Python 3.12+
- **LLM:** Azure OpenAI (GPT-4.1-mini, GPT-5, GPT-5-mini)
- **検索エンジン:** Elasticsearch 9.0.1
- **データベース:** DynamoDB (チャット履歴保存)
- **観測可能性:** Langfuse (トレース・メトリクス)
- **通知:** SNS (エラー通知)

### 検索アルゴリズム

1. **ハイブリッド検索:** BM25（キーワード）+ ベクトル類似度（セマンティック）
2. **リランキング:** LLMベースのリランキングで精度向上
3. **クエリ拡張:** LLMによるクエリの言い換え・拡張（オプション）

### セキュリティ

- VPC内からのアクセスのみ許可（Private API Gateway）
- 事業所コードによる動的フィルタリング
- 機密情報は Parameter Store で管理

---

## バージョン情報

- **API バージョン:** v1
- **最終更新日:** 2025-12-08
- **ドキュメントバージョン:** 1.2.0
- **変更履歴:**
  - v1.2.0 (2025-12-08): 固定パラメータの注記を追加、すべてのレスポンス例に`manned_counter_info`を追加
  - v1.1.0 (2025-12-04): レスポンス形式を辞書ネスト構造に変更（`faq`と`rag`オブジェクト）
  - v1.0.0 (2025-12-03): 初版リリース
