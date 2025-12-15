# 社員情報取得 API仕様書

## 概要

`src/get_employee/handler.py` のLambda関数は、miam_idを受け取り、DynamoDBから対応する社員情報を取得して返します。

**エンドポイント:** `/v1/get_employee` (GET/POST)

---

## 入力仕様

### リクエスト構造

#### GETメソッド（推奨）

```http
GET /v1/get_employee?miam_id=user@example.com HTTP/1.1
x-apigw-api-id: qsenl832o9
Content-Type: application/json
```

#### POSTメソッド（後方互換性のため対応）

```json
{
  "httpMethod": "POST",
  "path": "/get_employee",
  "headers": {
    "x-apigw-api-id": "qsenl832o9",
    "Content-Type": "application/json"
  },
  "body": {
    "miam_id": "user@example.com"
  }
}
```

### リクエストパラメータ

#### 必須パラメータ

| パラメータ | 型       | 説明                                    | 例                       |
| ---------- | -------- | --------------------------------------- | ------------------------ |
| `miam_id`  | `string` | ユーザーのMIAM ID（メールアドレス形式） | `"testuser@example.com"` |

**注意:**

- miam_idは必ず `@` を含むメールアドレス形式である必要があります
- `@` 以前の文字列がDynamoDBの検索キー（`name`）として使用されます

---

## リクエスト例

### GETメソッド

```http
GET /v1/get_employee?miam_id=testuser@example.com HTTP/1.1
x-apigw-api-id: qsenl832o9
Content-Type: application/json
```

### POSTメソッド（最小構成）

```json
{
  "miam_id": "testuser@example.com"
}
```

### POSTメソッド（API Gateway経由）

```json
{
  "httpMethod": "POST",
  "path": "/get_employee",
  "headers": {
    "x-apigw-api-id": "qsenl832o9",
    "Content-Type": "application/json"
  },
  "body": "{\"miam_id\": \"testuser@example.com\"}"
}
```

---

## 出力仕様

### レスポンス構造

```json
{
  "statusCode": 200,
  "body": "{\"employee\": {...}}"
}
```

**注意:** `body` フィールドはJSON文字列としてエンコードされています。

### 成功レスポンス（社員情報が見つかった場合）

**ステータスコード:** `200 OK`

```json
{
  "statusCode": 200,
  "body": "{\"employee\": {\"name\": \"testuser\", \"displayName\": \"Test User\", \"company\": \"Test Company\", \"co\": \"Japan\", \"office\": \"Tokyo Office\", \"department\": \"Engineering\", \"mail\": \"testuser@example.com\"}}"
}
```

#### 社員情報オブジェクトの構造

`body` をJSON.parseした結果:

```json
{
  "employee": {
    "name": "testuser",
    "displayName": "Test User",
    "company": "Test Company",
    "co": "Japan",
    "office": "Tokyo Office",
    "department": "Engineering",
    "mail": "testuser@example.com"
  }
}
```

| フィールド    | 型       | 説明                               | 例                       |
| ------------- | -------- | ---------------------------------- | ------------------------ |
| `name`        | `string` | ユーザー名（mail の @ 以前の部分） | `"testuser"`             |
| `displayName` | `string` | 表示名                             | `"Test User"`            |
| `company`     | `string` | 所属会社名                         | `"Test Company"`         |
| `co`          | `string` | 国コード                           | `"Japan"`                |
| `office`      | `string` | 事業所名                           | `"Tokyo Office"`         |
| `department`  | `string` | 部署名                             | `"Engineering"`          |
| `mail`        | `string` | メールアドレス                     | `"testuser@example.com"` |

**注意:** DynamoDBに格納されている全てのフィールドが返されます。上記は一般的なフィールドの例です。

### 成功レスポンス（社員情報が見つからない場合）

**ステータスコード:** `200 OK`

以下のケースで空オブジェクトが返されます:

- DynamoDBに該当するレコードが存在しない場合
- `co` フィールドが `"Japan"` 以外の値の場合

```json
{
  "statusCode": 200,
  "body": "{\"employee\": {}}"
}
```

### エラーレスポンス

#### 400 Bad Request: miam_idが含まれていない

```json
{
  "statusCode": 400,
  "body": "{\"error\": \"リクエストに miam_id が含まれていません\"}"
}
```

#### 400 Bad Request: miam_id形式が不正

```json
{
  "statusCode": 400,
  "body": "{\"error\": \"miam_id の形式が不正です。エラー内容: miam_id に @ が含まれていません: invalidmiam_id\"}"
}
```

#### 400 Bad Request: JSONパースエラー

```json
{
  "statusCode": 400,
  "body": "{\"error\": \"リクエストボディの JSON パースに失敗しました。エラー内容: ...\"}"
}
```

#### 500 Internal Server Error: DynamoDBエラー

```json
{
  "statusCode": 500,
  "body": "{\"error\": \"DynamoDB からの社員情報取得処理でエラーが生じました。エラー内容: ...\"}"
}
```

---

## ステータスコード一覧

| コード | 説明             | 発生条件                                  |
| ------ | ---------------- | ----------------------------------------- |
| `200`  | 成功             | 正常処理完了（社員情報あり/なし両方）     |
| `400`  | リクエストエラー | miam_id未指定、形式不正、JSONパースエラー |
| `500`  | サーバーエラー   | DynamoDB接続エラー、予期せぬエラー        |

---

## ビジネスロジック

### 処理フロー

1. **リクエストパース**
   - GETメソッドの場合: `queryStringParameters` から `miam_id` を取得
   - POSTメソッドの場合: `body` から `miam_id` を取得

2. **miam_id検証**
   - miam_idに `@` が含まれているかチェック
   - `@` 以前の文字列を抽出（例: `testuser@example.com` → `testuser`）

3. **DynamoDB検索**
   - Parameter Store から DynamoDB テーブル名を取得
   - 抽出した `name` をキーとしてクエリ実行（Limit: 1）

4. **フィルタリング**
   - `co` フィールドが `"Japan"` であるかチェック
   - `"Japan"` 以外の場合は空オブジェクトを返す

5. **レスポンス返却**
   - 社員情報が存在し、`co="Japan"` の場合: 社員情報を返却
   - それ以外の場合: 空オブジェクト `{}` を返却

### 重要な仕様

#### 国コードフィルタリング

- `co` フィールドが `"Japan"` のレコードのみ返却されます
- `co` が `"Japan"` 以外（例: `"USA"`, `""` など）の場合、レコードが存在しても空オブジェクトが返されます
- これは日本国内の社員情報のみを扱うためのビジネスルールです

#### 検索キーの抽出

- miam_idから `@` 以前の文字列を抽出して検索キーとします
- 例:
  - `testuser@example.com` → 検索キー: `testuser`
  - `test.user@example.com` → 検索キー: `test.user`
  - `testuser123@example.com` → 検索キー: `testuser123`

---

## 環境変数

| 変数名 | 説明     | 例                        |
| ------ | -------- | ------------------------- |
| `ENV`  | 実行環境 | `"dev"`, `"stg"`, `"prd"` |

## Parameter Store パラメータ

| パラメータ名                        | 説明                       | 例                     |
| ----------------------------------- | -------------------------- | ---------------------- |
| `/cdx/dynamodb/employee_table_name` | 社員情報DynamoDBテーブル名 | `"employee-table-dev"` |

---

## DynamoDBテーブル構造

### テーブル設計

- **Partition Key**: `name` (String) - miam_idの @ 以前の文字列
- **リージョン**: `ap-northeast-1`
- **クエリ制限**: Limit 1（最初の1件のみ取得）

### レコード例

```json
{
  "name": "testuser",
  "displayName": "Test User",
  "company": "Test Company",
  "co": "Japan",
  "office": "Tokyo Office",
  "department": "Engineering",
  "mail": "testuser@example.com"
}
```

---

## エラーハンドリング

### カスタムエラー

`LambdaHandlerError` クラスを使用してアプリケーションレベルのエラーを管理:

```python
raise LambdaHandlerError(
    message="エラーメッセージ",
    error_code=HTTPStatus.BAD_REQUEST
)
```

### ロギング

- **INFO**: 正常処理、社員情報の取得/未検出ログ
- **ERROR**: DynamoDBエラー、予期せぬエラー、スタックトレース

---

## 使用例

### ケース1: 社員情報が見つかる場合（GETメソッド - 推奨）

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_employee?miam_id=testuser@example.com" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X GET
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
    "employee": {
      "name": "testuser",
      "displayName": "山田 太郎",
      "company": "株式会社村田製作所",
      "co": "Japan",
      "office": "本社",
      "department": "技術開発部",
      "mail": "testuser@example.com"
    }
  }
}
```

---

### ケース2: 社員情報が見つからない場合（POSTメソッド）

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_employee" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "miam_id": "unknown@example.com"
  }'
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
    "employee": {}
  }
}
```

**ポイント:**

- DynamoDBにレコードが存在しない場合、空オブジェクトが返される
- HTTPステータスは200（エラーではない）

---

### ケース3: 国コードが"Japan"以外の場合

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_employee?miam_id=ususer@example.com" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X GET
```

**DynamoDBのレコード例:**

```json
{
  "name": "ususer",
  "displayName": "John Doe",
  "company": "Murata USA",
  "co": "USA",
  "office": "Atlanta Office",
  "department": "Sales",
  "mail": "ususer@example.com"
}
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
    "employee": {}
  }
}
```

**ポイント:**

- レコードは存在するが、`co` が `"Japan"` ではないため空オブジェクトが返される
- これは日本国内社員のみを対象とするビジネスルール

---

### ケース4: mail形式エラー

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_employee" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "mail": "invalidmiam_id"
  }'
```

**レスポンス:**

```json
{
  "statusCode": 400,
  "body": {
    "error": "mail の形式が不正です。エラー内容: mail に @ が含まれていません: invalidmiam_id"
  }
}
```

**ポイント:**

- mailは必ず `@` を含むメールアドレス形式である必要がある

---

### ケース5: mailパラメータ未指定

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_employee" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X GET
```

**レスポンス:**

```json
{
  "statusCode": 400,
  "body": {
    "error": "リクエストに mail が含まれていません"
  }
}
```

---

### Pythonクライアント

```python
import requests
import json

# GETメソッド
response = requests.get(
    "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_employee",
    params={"mail": "testuser@example.com"},
    headers={"x-apigw-api-id": "qsenl832o9"}
)

# POSTメソッド
response = requests.post(
    "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_employee",
    json={"mail": "testuser@example.com"},
    headers={"x-apigw-api-id": "qsenl832o9"}
)

# レスポンスパース
result = response.json()
body = json.loads(result["body"])
employee = body.get("employee", {})

if employee:
    print(f"社員名: {employee['displayName']}")
    print(f"部署: {employee['department']}")
else:
    print("社員情報が見つかりませんでした")
```

### JavaScriptクライアント

```javascript
// GETメソッド
const response = await fetch(
  'https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_employee?mail=testuser@example.com',
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-apigw-api-id': 'qsenl832o9',
    },
  }
);

// POSTメソッド
const response = await fetch(
  'https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_employee',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-apigw-api-id': 'qsenl832o9',
    },
    body: JSON.stringify({ mail: 'testuser@example.com' }),
  }
);

// レスポンスパース
const result = await response.json();
const body = JSON.parse(result.body);
const employee = body.employee;

if (Object.keys(employee).length > 0) {
  console.log(`社員名: ${employee.displayName}`);
  console.log(`部署: ${employee.department}`);
} else {
  console.log('社員情報が見つかりませんでした');
}
```
