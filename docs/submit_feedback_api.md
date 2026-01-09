# フィードバック送信API仕様書

## 概要

チャットボットの回答に対するユーザーフィードバック（good/bad）を受け取り、DynamoDBの会話履歴テーブルに保存するAPIです。

**エンドポイント:** `/v1/submit_feedback` (POST)

---

## エンドポイント情報

### 開発環境 (dev)

- **VPC Endpoint DNS**: `vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com`
- **API Gateway ID**: `qsenl832o9`
- **完全なエンドポイントURL**:
  ```
  https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/submit_feedback
  ```

### ステージング環境 (stg)

- **VPC Endpoint DNS**: `vpce-0944aca42fd27bd31-rulercsz.execute-api.ap-northeast-1.vpce.amazonaws.com`
- **API Gateway ID**: `exdcbyuyvi`
- **完全なエンドポイントURL**:
  ```
  https://vpce-0944aca42fd27bd31-rulercsz.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/submit_feedback
  ```

**注意**:

- これらのエンドポイントはVPC内からのみアクセス可能です
- API Gateway IDは`x-apigw-api-id`ヘッダーに設定する必要があります

## curl実行例

### 開発環境 (dev)

#### good フィードバック

```bash
curl -X POST \
  "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/submit_feedback" \
  -H "Content-Type: application/json" \
  -H "x-apigw-api-id: qsenl832o9" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "conversation_time": "2024-01-15T10:30:00+09:00#550e8400-e29b-41d4-a716-446655440001",
    "feedback": "good"
  }'
```

#### bad フィードバック

```bash
curl -X POST \
  "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/submit_feedback" \
  -H "Content-Type: application/json" \
  -H "x-apigw-api-id: qsenl832o9" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "conversation_time": "2024-01-15T10:30:00+09:00#550e8400-e29b-41d4-a716-446655440001",
    "feedback": "bad",
    "feedback_reason": "回答が不正確です"
  }'
```

### ステージング環境 (stg)

#### good フィードバック

```bash
curl -X POST \
  "https://vpce-0944aca42fd27bd31-rulercsz.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/submit_feedback" \
  -H "Content-Type: application/json" \
  -H "x-apigw-api-id: exdcbyuyvi" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "conversation_time": "2024-01-15T10:30:00+09:00#550e8400-e29b-41d4-a716-446655440001",
    "feedback": "good"
  }'
```

#### bad フィードバック

```bash
curl -X POST \
  "https://vpce-0944aca42fd27bd31-rulercsz.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/submit_feedback" \
  -H "Content-Type: application/json" \
  -H "x-apigw-api-id: exdcbyuyvi" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "conversation_time": "2024-01-15T10:30:00+09:00#550e8400-e29b-41d4-a716-446655440001",
    "feedback": "bad",
    "feedback_reason": "回答が不正確です"
  }'
```

---

## 入力仕様

### リクエストパラメータ

#### 必須パラメータ

| パラメータ          | 型       | 説明                                                 | 制約                                               |
| ------------------- | -------- | ---------------------------------------------------- | -------------------------------------------------- |
| `session_id`        | `string` | セッションID（会話履歴テーブルのパーティションキー） | UUIDv4形式を推奨                                   |
| `conversation_time` | `string` | 会話時刻（会話履歴テーブルのソートキー）             | 日本時刻JST + UUID形式、時系列ソートと一意性を保証 |
| `feedback`          | `string` | フィードバックタイプ                                 | `"good"` または `"bad"` のみ許可                   |

#### オプションパラメータ

| パラメータ        | 型        | デフォルト値 | 説明                                                                 |
| ----------------- | --------- | ------------ | -------------------------------------------------------------------- |
| `feedback_reason` | `string?` | `null`       | フィードバックの理由（DynamoDBの`feedbackReason`カラムに保存される） |

**注意:**

- `feedback_reason` パラメータが提供された場合、DynamoDBの `feedbackReason` カラムに保存されます
- 省略した場合は、`feedbackReason` カラムは更新されません（既存の値がある場合は保持される）

### リクエスト例

#### 基本的なリクエスト（必須パラメータのみ）

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "conversation_time": "2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890",
  "feedback": "good"
}
```

#### feedback_reasonを含むリクエスト

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "conversation_time": "2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890",
  "feedback": "bad",
  "feedback_reason": "情報が不足していました"
}
```

---

## 出力仕様

**重要**: このAPIはLambda Proxy統合を使用しています。すべてのレスポンスの `body` フィールドはJSON文字列として返されます。HTTPクライアントで `response.json()` などでパースしてください。また、すべてのレスポンスにはCORS対応のヘッダー（`Access-Control-Allow-Origin: *`）が含まれます。

### 成功レスポンス

#### ステータスコード: `200 OK`

```json
{
  "statusCode": 200,
  "body": "{\"message\":\"フィードバックを正常に保存しました\",\"session_id\":\"550e8400-e29b-41d4-a716-446655440000\",\"conversation_time\":\"2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890\"}"
}
```

#### レスポンスフィールド (bodyをパース後)

| フィールド          | 型       | 説明                               |
| ------------------- | -------- | ---------------------------------- |
| `message`           | `string` | 処理結果メッセージ                 |
| `session_id`        | `string` | リクエストで指定されたセッションID |
| `conversation_time` | `string` | リクエストで指定された会話時刻     |

### エラーレスポンス

#### エラーレスポンス構造

```json
{
  "statusCode": <HTTP_STATUS_CODE>,
  "body": "{\"error\":\"<エラーメッセージ>\"}"
}
```

#### エラーコード一覧

| HTTPステータス | 発生条件                             | メッセージ例                                                                                                 |
| -------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `400`          | リクエストボディが空                 | `"リクエストボディが空です"`                                                                                 |
| `400`          | JSON形式が不正                       | `"リクエストした body の形式が正しくありません。エラー内容：..."`                                            |
| `400`          | 必須パラメータ不足                   | `"必須パラメータが不足しているか、不正な値です。エラー内容：session_id is required"`                         |
| `400`          | feedback が不正                      | `"必須パラメータが不足しているか、不正な値です。エラー内容：feedback must be 'good' or 'bad', got: Invalid"` |
| `500`          | DynamoDB更新エラー・予期しないエラー | `"DynamoDBへのフィードバック保存に失敗しました。エラー内容：..."`                                            |

#### エラーレスポンス例

**リクエストボディが空**

```json
{
  "statusCode": 400,
  "body": "{\"error\":\"リクエストボディが空です\"}"
}
```

**JSONパースエラー**

```json
{
  "statusCode": 400,
  "body": "{\"error\":\"リクエストした body の形式が正しくありません。エラー内容：...\"}"
}
```

**必須パラメータ不足**

```json
{
  "statusCode": 400,
  "body": "{\"error\":\"必須パラメータが不足しているか、不正な値です。エラー内容：session_id is required\"}"
}
```

**feedback バリデーションエラー**

```json
{
  "statusCode": 400,
  "body": "{\"error\":\"必須パラメータが不足しているか、不正な値です。エラー内容：feedback must be 'good' or 'bad', got: ...\"}"
}
```

**DynamoDBエラー（レコードが存在しない場合など）**

```json
{
  "statusCode": 500,
  "body": "{\"error\":\"DynamoDBへのフィードバック保存に失敗しました。エラー内容：...\"}"
}
```

---

## DynamoDBデータ構造

### 会話履歴テーブルの構造

会話履歴テーブルは以下の複合キー構造を持ちます：

| カラム名           | キー種別 | データ型 | 説明                                          |
| ------------------ | -------- | -------- | --------------------------------------------- |
| `sessionId`        | PK       | String   | セッションID                                  |
| `conversationTime` | SK       | String   | 会話発生時刻（日本時刻JST + UUID）            |
| `chatHistory`      | -        | Object   | 会話1ラリーの内容（user + assistant）         |
| `company`          | -        | String   | 会社コード                                    |
| `office`           | -        | String   | 事業所コード                                  |
| `mail`             | -        | String   | メールアドレス                                |
| `feedBack`         | -        | String   | ユーザーフィードバック（"good" または "bad"） |
| ...                | -        | ...      | その他の属性                                  |

### フィードバック保存のデータ例

フィードバックは、特定の会話レコード（sessionId + conversationTime）の `feedBack` カラムに保存されます：

```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "conversationTime": "2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890",
  "chatHistory": {
    "user": "経費精算の期限はいつですか？",
    "assistant": "経費精算の期限は毎月末です。"
  },
  "company": "MMC",
  "office": "MM00",
  "mail": "user@example.com",
  "feedBack": "good" // フィードバックAPI呼び出しで追加・更新される
}
```

### feedBack カラムの仕様

| 項目           | 説明                                                |
| -------------- | --------------------------------------------------- |
| データ型       | String                                              |
| 取りうる値     | `"good"` または `"bad"`                             |
| 保存タイミング | フィードバックAPI呼び出し時にUpdateItemで追加・更新 |
| 初期値         | 存在しない（フィードバック未送信の場合）            |

**特徴:**

- 1レコード（1会話ラリー）に対して1つのフィードバック
- リクエストもDynamoDBへの保存も小文字 `"good"` / `"bad"` で統一
- 同じ会話に対して再度フィードバックを送信すると、feedBack カラムが上書きされる

---

## 処理フロー

```
【リクエスト受信】
    ↓
【JSONパース処理】
    ├─ bodyが文字列の場合 → JSON.parse()
    └─ bodyが辞書の場合 → そのまま使用
    ↓
【パラメータバリデーション】
    ├─ session_id の存在確認
    ├─ conversation_time の存在確認
    ├─ feedback の存在確認
    └─ feedback の値検証（"good" または "bad"）
    ↓
    ├─ バリデーションエラー → 400 Bad Request
    ↓
【DynamoDB更新処理】
    ├─ テーブル名を Parameter Store から取得
    ├─ DynamoDBリソースの初期化
    ├─ feedback は既に小文字（念のため小文字に変換）
    └─ UpdateItem API を使用してフィードバック情報を保存
        ├─ Key: {sessionId: <sessionId>, conversationTime: <conversationTime>}
        ├─ UpdateExpression: feedBack カラムを更新
        └─ ExpressionAttributeValues:
            └─ feedBack: "good" または "bad"
    ↓
    ├─ DynamoDBエラー → 500 Internal Server Error
    ↓
【成功レスポンス返却】
    └─ 200 OK + 成功メッセージ
```

---

## 実装例

### Python (requests)

```python
import requests

url = "https://YOUR_API_GATEWAY_ENDPOINT/v1/submit_feedback"

payload = {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "conversation_time": "2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890",
    "feedback": "good"
}

response = requests.post(
    url,
    json=payload,
    headers={
        "x-apigw-api-id": "YOUR_API_GATEWAY_ID",
        "Content-Type": "application/json"
    }
)

if response.status_code == 200:
    result = response.json()
    print(f"Success: {result['message']}")
    print(f"SessionId: {result['session_id']}")
else:
    print(f"Error: {response.status_code}")
    print(response.json())
```

### JavaScript (fetch)

```javascript
const url = 'https://YOUR_API_GATEWAY_ENDPOINT/v1/submit_feedback';

const payload = {
  session_id: '550e8400-e29b-41d4-a716-446655440000',
  conversation_time: '2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890',
  feedback: 'good',
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-apigw-api-id': 'YOUR_API_GATEWAY_ID',
  },
  body: JSON.stringify(payload),
})
  .then(response => response.json())
  .then(data => {
    console.log(`Success: ${data.message}`);
    console.log(`SessionId: ${data.session_id}`);
  })
  .catch(error => console.error('Error:', error));
```

---

## ユースケース

### ケース1: good フィードバックの送信

ユーザーがチャットボットの回答に満足した場合。

**リクエスト:**

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "conversation_time": "2025-12-11T14:20:30+09:00_uuid-12345",
  "feedback": "good"
}
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": "{\"message\":\"フィードバックを正常に保存しました\",\"session_id\":\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\",\"conversation_time\":\"2025-12-11T14:20:30+09:00_uuid-12345\"}"
}
```

### ケース2: bad フィードバックの送信

ユーザーがチャットボットの回答に不満がある場合。

**リクエスト:**

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "conversation_time": "2025-12-11T14:25:15+09:00_uuid-67890",
  "feedback": "bad",
  "feedback_reason": "回答が質問にマッチしていませんでした"
}
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": "{\"message\":\"フィードバックを正常に保存しました\",\"session_id\":\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\",\"conversation_time\":\"2025-12-11T14:25:15+09:00_uuid-67890\"}"
}
```

### ケース3: フィードバックの上書き

同じ会話（sessionId + conversationTime）に対して再度フィードバックを送信すると、feedBack カラムが上書きされます。例えば、最初に "good" を送信し、その後同じ会話に "bad" を送信した場合、DynamoDBの feedBack カラムは "bad" に更新されます。

---

## トラブルシューティング

### よくあるエラーと対処法

| エラーメッセージ                                 | 原因                                     | 対処法                                                                                                                                     |
| ------------------------------------------------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `"リクエストボディが空です"`                     | リクエストボディが `null` または空文字列 | JSON形式のリクエストボディを送信する                                                                                                       |
| `"session_id is required"`                       | session_id パラメータが欠けている        | 必須パラメータ（session_id, conversation_time, feedback）を全て指定                                                                        |
| `"feedback must be 'good' or 'bad'"`             | feedback の値が不正                      | feedback は `"good"` または `"bad"` のみ指定可能                                                                                           |
| `"リクエストした body の形式が正しくありません"` | JSON形式が不正                           | JSON構文を確認（末尾カンマ、引用符、括弧など）                                                                                             |
| `"DynamoDBへのフィードバック保存に失敗しました"` | レコードが存在しない、または権限不足     | 1) RAG自動回答APIで会話を行った後にフィードバックを送信<br>2) conversation_time の値が正確であることを確認<br>3) Lambda関数のIAM権限を確認 |

---

## 技術仕様

### 使用技術

- **言語:** Python 3.12+
- **データベース:** DynamoDB（会話履歴テーブル）
- **パラメータ管理:** AWS Systems Manager Parameter Store
- **実行環境:** AWS Lambda

### DynamoDB操作

#### UpdateItem API の使用

```python
table.update_item(
    Key={
        "sessionId": session_id,
        "conversationTime": conversation_time,
    },
    UpdateExpression="SET feedBack = :feedback_value",
    ExpressionAttributeValues={
        ":feedback_value": feedback_value,  # "good" または "bad"
    },
    ConditionExpression="attribute_exists(#pk) AND attribute_exists(#sk)",
    ExpressionAttributeNames={
        "#pk": "sessionId",
        "#sk": "conversationTime",
    },
    ReturnValues="UPDATED_NEW",
)
```

**特徴:**

- **複合キー**: sessionId（PK）と conversationTime（SK）の両方を指定
- **既存レコードのみ更新**: `ConditionExpression` により、レコードが存在する場合のみ更新（新規作成を防止）
- **シンプルな更新**: feedBack カラムを直接設定
- **小文字統一**: リクエストもDynamoDBへの保存も "good"/"bad" で統一

### AWS リソース

- **DynamoDBテーブル**: Parameter Store から取得
  - パス形式: `/{ENV}/cdx/dynamodb/chat_history_table_name`
  - 例: 開発環境では `/dev/cdx/dynamodb/chat_history_table_name`
  - 実装: `get_parameter("dynamodb/chat_history_table_name", environment=ENV)` で自動的に環境プレフィックスが付与される
- **テーブル構造**:
  - PK: `sessionId` (String)
  - SK: `conversationTime` (String)
  - feedBack カラム: String型（"good" または "bad"）
- **IAM権限**: Lambda実行ロールに以下の権限が必要
  - `dynamodb:UpdateItem`
  - `ssm:GetParameter`

---

## 注意事項

### conversationTime の形式

- **形式**: 日本時刻（JST）+ UUID
- **例**: `2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890`
- **目的**:
  - 時系列ソートの実現（JST時刻が先頭）
  - 一意性の保証（UUID が付加）
- **制約**: DynamoDBのソートキーとして使用できる文字のみ

### feedback の形式

- **リクエスト**: `"good"` または `"bad"` (小文字)
- **DynamoDB保存**: `"good"` または `"bad"` (小文字)
- **理由**: リクエストとデータベースで統一した形式を使用

### feedback_reason パラメータ

- `feedback_reason`パラメータが提供された場合、DynamoDBの`feedbackReason`カラムに保存されます
- 省略した場合は、`feedbackReason`カラムは更新されません
- フィードバックの詳細な理由を記録するために使用できます

### レコードの存在確認

- フィードバックAPIは、指定された sessionId + conversationTime のレコードが存在することを前提としています
- レコードが存在しない場合、DynamoDBの `ConditionExpression` により新規レコードの作成を防止し、500 Internal Server Error を返します
- エラーメッセージ例: `"DynamoDBへのフィードバック保存に失敗しました。エラー内容：The conditional request failed"`
- **推奨**: RAG自動回答APIで会話が行われた後に、その conversationTime を使用してフィードバックを送信する
- **注意**: 実装では `attribute_exists(sessionId) AND attribute_exists(conversationTime)` の条件チェックを行っています
