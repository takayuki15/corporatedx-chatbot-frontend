# フィードバック削除API仕様書

## 概要

チャットボットの回答に対するユーザーフィードバック（good/bad）を削除するAPIです。DynamoDBの会話履歴テーブルから`feedBack`および`feedbackReason`カラムを物理削除（REMOVE操作）します。

**エンドポイント:** `/v1/delete_feedback` (DELETE)

---

## エンドポイント情報

### 開発環境 (dev)

- **VPC Endpoint DNS**: `vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com`
- **API Gateway ID**: `qsenl832o9`
- **完全なエンドポイントURL**:
  ```
  https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/delete_feedback
  ```

### ステージング環境 (stg)

- **VPC Endpoint DNS**: `vpce-0944aca42fd27bd31-rulercsz.execute-api.ap-northeast-1.vpce.amazonaws.com`
- **API Gateway ID**: `exdcbyuyvi`
- **完全なエンドポイントURL**:
  ```
  https://vpce-0944aca42fd27bd31-rulercsz.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/delete_feedback
  ```

**注意**:

- これらのエンドポイントはVPC内からのみアクセス可能です
- API Gateway IDは`x-apigw-api-id`ヘッダーに設定する必要があります

## curl実行例

### 開発環境 (dev)

```bash
curl -X DELETE \
  "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/delete_feedback" \
  -H "Content-Type: application/json" \
  -H "x-apigw-api-id: qsenl832o9" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "conversation_time": "2024-01-15T10:30:00+09:00#550e8400-e29b-41d4-a716-446655440001"
  }'
```

### ステージング環境 (stg)

```bash
curl -X DELETE \
  "https://vpce-0944aca42fd27bd31-rulercsz.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/delete_feedback" \
  -H "Content-Type: application/json" \
  -H "x-apigw-api-id: exdcbyuyvi" \
  -d '{
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "conversation_time": "2024-01-15T10:30:00+09:00#550e8400-e29b-41d4-a716-446655440001"
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

### リクエスト例

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "conversation_time": "2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890"
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
  "body": "{\"message\":\"フィードバックを正常に削除しました\",\"session_id\":\"550e8400-e29b-41d4-a716-446655440000\",\"conversation_time\":\"2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890\"}"
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

| HTTPステータス | 発生条件                                 | メッセージ例                                                                         |
| -------------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `400`          | リクエストボディが空                     | `"リクエストボディが空です"`                                                         |
| `400`          | JSON形式が不正                           | `"リクエストした body の形式が正しくありません。エラー内容：..."`                    |
| `400`          | 必須パラメータ不足                       | `"必須パラメータが不足しているか、不正な値です。エラー内容：session_id is required"` |
| `404`          | レコードまたはフィードバックが存在しない | `"指定された会話履歴またはフィードバックが見つかりません"`                           |
| `500`          | DynamoDB削除エラー・予期しないエラー     | `"フィードバックの削除に失敗しました。エラー内容：..."`                              |

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

**レコードまたはフィードバックが存在しない（404エラー）**

```json
{
  "statusCode": 404,
  "body": "{\"error\":\"指定された会話履歴またはフィードバックが見つかりません\"}"
}
```

**DynamoDBエラー**

```json
{
  "statusCode": 500,
  "body": "{\"error\":\"フィードバックの削除に失敗しました。エラー内容：...\"}"
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
| `feedbackReason`   | -        | String   | フィードバックの理由（オプション）            |
| ...                | -        | ...      | その他の属性                                  |

### フィードバック削除の動作

フィードバック削除APIは、特定の会話レコード（session_id + conversation_time）から `feedBack` と `feedbackReason` カラムを物理削除（REMOVE操作）します：

**削除前:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "conversation_time": "2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890",
  "chatHistory": {
    "user": "経費精算の期限はいつですか？",
    "assistant": "経費精算の期限は毎月末です。"
  },
  "company": "MMC",
  "office": "MM00",
  "mail": "user@example.com",
  "feedBack": "good",
  "feedbackReason": "とても役に立ちました"
}
```

**削除後:**

```json
{
  "session_id": "550e8400-e29b-41d4-a716-446655440000",
  "conversation_time": "2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890",
  "chatHistory": {
    "user": "経費精算の期限はいつですか？",
    "assistant": "経費精算の期限は毎月末です。"
  },
  "company": "MMC",
  "office": "MM00",
  "mail": "user@example.com"
  // feedBack と feedbackReason カラムが削除されています
}
```

### feedBack / feedbackReason カラムの仕様

| 項目           | 説明                                      |
| -------------- | ----------------------------------------- |
| データ型       | String                                    |
| 削除方式       | 物理削除（REMOVE操作）                    |
| 削除タイミング | フィードバック削除API呼び出し時に完全削除 |
| 復元可能性     | 不可（物理削除のため）                    |

**特徴:**

- 会話履歴本体は残り、フィードバック情報のみが削除される
- `feedBack` と `feedbackReason` の両方が同時に削除される
- 削除後は、フィードバックが送信されていない状態と同じになる
- 復元不可能な操作のため、実行には注意が必要

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
    └─ conversation_time の存在確認
    ↓
    ├─ バリデーションエラー → 400 Bad Request
    ↓
【DynamoDB削除処理】
    ├─ テーブル名を Parameter Store から取得
    ├─ DynamoDBリソースの初期化
    └─ UpdateItem API (REMOVE操作) を使用してフィードバック情報を削除
        ├─ Key: {session_id: <session_id>, conversation_time: <conversation_time>}
        ├─ UpdateExpression: "REMOVE feedBack, feedbackReason"
        ├─ ConditionExpression: レコードとfeedBackが存在する場合のみ削除
        └─ 存在チェック:
            ├─ レコードが存在しない → 404 Not Found
            └─ feedBackが存在しない → 404 Not Found
    ↓
    ├─ レコード/フィードバック不存在 → 404 Not Found
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

url = "https://YOUR_API_GATEWAY_ENDPOINT/v1/delete_feedback"

payload = {
    "session_id": "550e8400-e29b-41d4-a716-446655440000",
    "conversation_time": "2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890"
}

response = requests.delete(
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
elif response.status_code == 404:
    result = response.json()
    print(f"Not Found: {result['error']}")
else:
    print(f"Error: {response.status_code}")
    print(response.json())
```

### JavaScript (fetch)

```javascript
const url = 'https://YOUR_API_GATEWAY_ENDPOINT/v1/delete_feedback';

const payload = {
  session_id: '550e8400-e29b-41d4-a716-446655440000',
  conversation_time: '2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890',
};

fetch(url, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'x-apigw-api-id': 'YOUR_API_GATEWAY_ID',
  },
  body: JSON.stringify(payload),
})
  .then(response => {
    if (response.ok) {
      return response.json();
    } else if (response.status === 404) {
      return response.json().then(data => {
        throw new Error(data.error);
      });
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  })
  .then(data => {
    console.log(`Success: ${data.message}`);
    console.log(`SessionId: ${data.session_id}`);
  })
  .catch(error => console.error('Error:', error));
```

---

## ユースケース

### ケース1: フィードバックの削除

ユーザーが誤ってフィードバックを送信した場合、または取り消したい場合。

**リクエスト:**

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "conversation_time": "2025-12-11T14:20:30+09:00_uuid-12345"
}
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": "{\"message\":\"フィードバックを正常に削除しました\",\"session_id\":\"a1b2c3d4-e5f6-7890-abcd-ef1234567890\",\"conversation_time\":\"2025-12-11T14:20:30+09:00_uuid-12345\"}"
}
```

### ケース2: 存在しないフィードバックの削除

フィードバックが既に削除されているか、最初から存在しない場合。

**リクエスト:**

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "conversation_time": "2025-12-11T14:25:15+09:00_uuid-67890"
}
```

**レスポンス:**

```json
{
  "statusCode": 404,
  "body": "{\"error\":\"指定された会話履歴またはフィードバックが見つかりません\"}"
}
```

### ケース3: フィードバックの再送信

フィードバックを削除した後、再度フィードバックを送信することが可能です。

1. `/v1/submit_feedback` でフィードバックを送信（"good"）
2. `/v1/delete_feedback` でフィードバックを削除
3. `/v1/submit_feedback` で新しいフィードバックを送信（"bad"）

---

## トラブルシューティング

### よくあるエラーと対処法

| エラーメッセージ                                           | 原因                                     | 対処法                                                                                                                                      |
| ---------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `"リクエストボディが空です"`                               | リクエストボディが `null` または空文字列 | JSON形式のリクエストボディを送信する                                                                                                        |
| `"session_id is required"`                                 | session_id パラメータが欠けている        | 必須パラメータ（session_id, conversation_time）を全て指定                                                                                   |
| `"リクエストした body の形式が正しくありません"`           | JSON形式が不正                           | JSON構文を確認（末尾カンマ、引用符、括弧など）                                                                                              |
| `"指定された会話履歴またはフィードバックが見つかりません"` | レコードまたはフィードバックが存在しない | 1) conversation_time の値が正確であることを確認<br>2) フィードバックが既に削除されていないか確認<br>3) RAG自動回答APIで会話が行われたか確認 |
| `"フィードバックの削除に失敗しました"`                     | DynamoDBエラーまたは権限不足             | 1) Lambda関数のIAM権限を確認<br>2) DynamoDBテーブルが存在することを確認                                                                     |

---

## 技術仕様

### 使用技術

- **言語:** Python 3.12+
- **データベース:** DynamoDB（会話履歴テーブル）
- **パラメータ管理:** AWS Systems Manager Parameter Store
- **実行環境:** AWS Lambda

### DynamoDB操作

#### UpdateItem API の使用（REMOVE操作）

```python
table.update_item(
    Key={
        "session_id": session_id,
        "conversation_time": conversation_time,
    },
    UpdateExpression="REMOVE feedBack, feedbackReason",
    ConditionExpression="attribute_exists(#pk) AND attribute_exists(#sk) AND attribute_exists(feedBack)",
    ExpressionAttributeNames={
        "#pk": "session_id",
        "#sk": "conversation_time",
    },
    ReturnValues="UPDATED_OLD",
)
```

**特徴:**

- **複合キー**: session_id（PK）と conversation_time（SK）の両方を指定
- **物理削除**: REMOVE操作により、属性自体を完全に削除
- **存在チェック**: `ConditionExpression` により、レコードとfeedBackが存在する場合のみ削除（存在しない場合は404エラー）
- **複数属性削除**: feedBack と feedbackReason を同時に削除

### AWS リソース

- **DynamoDBテーブル**: Parameter Store から取得
  - パス形式: `/{ENV}/cdx/dynamodb/chat_history_table_name`
  - 例: 開発環境では `/dev/cdx/dynamodb/chat_history_table_name`
  - 実装: `get_parameter("dynamodb/chat_history_table_name", environment=ENV)` で自動的に環境プレフィックスが付与される
- **テーブル構造**:
  - PK: `session_id` (String)
  - SK: `conversation_time` (String)
  - feedBack カラム: String型（"good" または "bad"）
  - feedbackReason カラム: String型（オプション）
- **IAM権限**: Lambda実行ロールに以下の権限が必要
  - `dynamodb:UpdateItem`
  - `ssm:GetParameter`

---

## 注意事項

### conversation_time の形式

- **形式**: 日本時刻（JST）+ UUID
- **例**: `2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890`
- **目的**:
  - 時系列ソートの実現（JST時刻が先頭）
  - 一意性の保証（UUID が付加）
- **制約**: DynamoDBのソートキーとして使用できる文字のみ

### 物理削除の注意点

- **復元不可能**: 一度削除したフィードバックは復元できません
- **監査証跡**: 削除の記録はDynamoDBに残りません（別途ログで確認可能）
- **代替案**: 論理削除が必要な場合は、別途実装を検討してください

### レコードの存在確認

- フィードバック削除APIは、指定された session_id + conversation_time のレコードとフィードバックが存在することを前提としています
- レコードまたはフィードバックが存在しない場合、DynamoDBの `ConditionExpression` により404 Not Found エラーを返します
- エラーメッセージ例: `"指定された会話履歴またはフィードバックが見つかりません"`
- **推奨**: RAG自動回答APIで会話が行われ、フィードバックが送信された後に削除する

### submit_feedback との関係

- **submit_feedback**: フィードバックを送信（SET操作で追加・更新）
- **delete_feedback**: フィードバックを削除（REMOVE操作で物理削除）
- 削除後に再度submit_feedbackを実行することで、新しいフィードバックを送信できます
