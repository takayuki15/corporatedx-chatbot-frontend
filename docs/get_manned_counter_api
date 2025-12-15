# 有人窓口情報取得 API仕様書

## 概要

`src/get_manned_counter/handler.py` のLambda関数は、DynamoDBから有人窓口情報を取得し、優先窓口情報とマージして返します。

**エンドポイント:** `/v1/get_manned_counter` (POST)

**`/v1/automated_answer` APIとの連携:**
- `/v1/automated_answer` APIのレスポンスに含まれる `priority_manned_counter_names` を、このAPIの入力パラメータとして使用できます
- これにより、ユーザーの質問に関連する窓口を自動的に優先表示し、詳細情報（メールアドレス、説明等）を取得できます

---

## 入力仕様

### リクエスト構造

```json
{
  "httpMethod": "POST",
  "path": "/v1/get_manned_counter",
  "headers": {
    "x-apigw-api-id": "qsenl832o9",
    "Content-Type": "application/json"
  },
  "body": {
    // リクエストパラメータ（JSON形式）
  }
}
```

### リクエストパラメータ

#### 必須パラメータ

| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `priority_manned_counter_names` | `array[string]` | 優先的に表示する窓口名のリスト（空配列可） |
| `company` | `string` | ユーザーの会社コード（フィルタリング用） |
| `office` | `string` | ユーザーの事業所コード（フィルタリング用） |

#### 優先窓口名リスト (`priority_manned_counter_names`)

優先的に表示したい窓口名を指定する場合、窓口名の配列を指定します。
窓口の詳細情報はDynamoDBから取得されるため、名前のみを指定すればよいです。

```json
{
  "priority_manned_counter_names": [
    "事業所見学窓口",
    "VIマネジメント窓口"
  ]
}
```

**`/v1/automated_answer` APIとの連携:**

`priority_manned_counter_names` は `/v1/automated_answer` API のレスポンスから取得することができます。
これにより、ユーザーの質問に関連する窓口を自動的に優先表示できます。

**使用例:**
```bash
# 1. automated_answer APIで質問に関連する窓口名を取得
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

詳細は `docs/automated_answer_api.md` を参照してください。

**注意:**
- 指定した窓口名がDynamoDBに存在しない場合は、その窓口は無視されます
- 窓口の詳細情報（メールアドレス、説明文など）は常にDynamoDBから取得されます
- これにより、データの一貫性が保たれ、DynamoDBで情報を更新すれば自動的に最新情報が返されます

---

## リクエスト例

### 基本構成（優先窓口なし）

```json
{
  "priority_manned_counter_names": [],
  "company": "MMC",
  "office": "TO001"
}
```

### 優先窓口指定あり

```json
{
  "priority_manned_counter_names": [
    "事業所見学窓口",
    "VIマネジメント窓口"
  ],
  "company": "MMC",
  "office": "TO001"
}
```

### 会社コードによるフィルタリング

```json
{
  "priority_manned_counter_names": [],
  "company": "MMC",
  "office": "HQ001"
}
```

**フィルタリング動作:**
- `ALLJPN` が登録されている窓口は全ユーザーに表示
- 特定の会社コードが登録されている窓口は、その会社のユーザーのみに表示
- `isOfficeAccessOnly` が `true` の窓口は、事業所コードが一致するユーザーのみに表示

### API Gateway経由

```json
{
  "httpMethod": "POST",
  "path": "/v1/get_manned_counter",
  "headers": {
    "x-apigw-api-id": "qsenl832o9",
    "Content-Type": "application/json"
  },
  "body": "{\"priority_manned_counter_names\":[\"事業所見学窓口\",\"VIマネジメント窓口\"],\"company\":\"MMC\",\"office\":\"TO001\"}"
}
```

---

## 出力仕様

### レスポンス構造

```json
{
  "statusCode": 200,
  "body": "{...}"
}
```

**注意:** `body` フィールドはJSON文字列としてエンコードされています。

### 成功レスポンス

**ステータスコード:** `200 OK`

```json
{
  "statusCode": 200,
  "body": "{\"manned_counter_info\": [{\"manned_counter_name\": \"事業所見学窓口\", \"manned_counter_email\": \"kengaku@example.com\", \"manned_counter_description\": \"事業所見学に関する問合せ窓口です。\"}, {\"manned_counter_name\": \"経費精算窓口\", \"manned_counter_email\": \"expenses@example.com\", \"manned_counter_description\": \"経費精算に関する問合せ窓口です。\"}]}"
}
```

#### レスポンスボディの構造

`body` をJSON.parseした結果:

```json
{
  "manned_counter_info": [
    {
      "manned_counter_name": "事業所見学窓口",
      "manned_counter_email": "kengaku@example.com",
      "manned_counter_description": "事業所見学に関する問合せ窓口です。"
    },
    {
      "manned_counter_name": "経費精算窓口",
      "manned_counter_email": "expenses@example.com",
      "manned_counter_description": "経費精算に関する問合せ窓口です。"
    }
  ]
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| `manned_counter_info` | `array[object]` | 有人窓口情報のリスト（優先窓口が先頭、その後にDynamoDBからの窓口） |

#### 窓口情報オブジェクトの構造

| フィールド | 型 | 説明 | 例 |
|-----------|-----|------|-----|
| `manned_counter_name` | `string` | 窓口名 | `"経費精算窓口"` |
| `manned_counter_email` | `string` | 窓口のメールアドレス | `"expenses@example.com"` |
| `manned_counter_description` | `string` | 窓口の説明 | `"経費精算に関する問合せ窓口です。"` |

**注意:** DynamoDBに格納されている全てのフィールドが返されます。上記は一般的なフィールドの例です。

### エラーレスポンス

#### 400 Bad Request: 必須パラメータ欠落

```json
{
  "statusCode": 400,
  "body": "{\"error\": \"必須パラメータが不足しています: priority_manned_counter_names, company, office\"}"
}
```

**発生条件:**
- `priority_manned_counter_names`、`company`、`office` のいずれかが欠落している場合

**例:**
- すべてのパラメータが欠落: `{}`
- `company` のみ欠落: `{"priority_manned_counter_names": [], "office": "TO001"}`
- `office` のみ欠落: `{"priority_manned_counter_names": [], "company": "MMC"}`

#### 500 Internal Server Error: DynamoDBエラー

```json
{
  "statusCode": 500,
  "body": "{\"error\": \"有人窓口情報の取得に失敗しました\", \"details\": \"An error occurred (ResourceNotFoundException) when calling the Scan operation: Requested resource not found\"}"
}
```

#### 500 Internal Server Error: 予期せぬエラー

```json
{
  "statusCode": 500,
  "body": "{\"error\": \"有人窓口情報の取得に失敗しました\", \"details\": \"...\"}"
}
```

---

## ステータスコード一覧

| コード | 説明 | 発生条件 |
|--------|------|----------|
| `200` | 成功 | 正常処理完了（窓口情報あり/なし両方） |
| `400` | クライアントエラー | 必須パラメータ欠落 |
| `500` | サーバーエラー | DynamoDB接続エラー、予期せぬエラー |

---

## ビジネスロジック

### 処理フロー

1. **リクエストパース**
   - `body` から `priority_manned_counter_names`（窓口名のリスト）を取得（デフォルトは空リスト）
   - `body` から `company`（会社コード）と `office`（事業所コード）を取得

2. **DynamoDBスキャン**
   - Parameter Store から DynamoDB テーブル名を取得
   - テーブルから全ての有人窓口情報をスキャン（ページネーション対応）
   - 取得するフィールド: `mannedCounterName`, `mannedCounterEmail`, `mannedCounterDescription`, `companyForSuggestingMannedCounter`, `isOfficeAccessOnly`, `officeForSuggestingMannedCounter`

3. **フィルタリング処理**
   - **会社コードフィルタリング**:
     - `companyForSuggestingMannedCounter` が空値の場合は除外
     - `ALLJPN` が含まれている場合は常に表示
     - それ以外の場合は、ユーザーの `company` が含まれている場合のみ表示
   - **事業所コードフィルタリング**:
     - `isOfficeAccessOnly` が `true` の場合、ユーザーの `office` が `officeForSuggestingMannedCounter` に含まれている場合のみ表示

4. **優先順位付け処理**
   - `priority_manned_counter_names` に指定された窓口名の順序で窓口情報を先頭に配置
   - 指定された窓口名がDynamoDBに存在しない場合は無視される
   - 残りの窓口情報を後方に追加
   - 重複除外: 優先窓口名に含まれる窓口は、残りの窓口リストから除外される

5. **レスポンス返却**
   - 優先順位付け・フィルタリング済みの窓口情報リストを返却

### 重要な仕様

#### 優先窓口の配置

- リクエストで指定された `priority_manned_counter_info` は必ず先頭に配置されます
- 優先窓口の順序はリクエストで指定された順序が保持されます
- これにより、特定のユースケースで特定の窓口を最初に表示できます

#### 重複除外ロジック

- `manned_counter_name` をキーとして重複を判定します
- 優先窓口情報と同じ名前の窓口がDynamoDBに存在する場合、DynamoDB側の情報は除外されます
- これにより、優先窓口の情報が常に優先されます

例:
```
優先窓口: ["経費精算窓口", "IT問い合わせ窓口"]
DynamoDB: ["経費精算窓口", "人事窓口", "総務窓口"]

結果: ["経費精算窓口"(優先), "IT問い合わせ窓口"(優先), "人事窓口"(DB), "総務窓口"(DB)]
       ↑ DynamoDBの"経費精算窓口"は除外される
```

---

## 環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `ENV` | 実行環境 | `"dev"`, `"stg"`, `"prd"` |
| `REGION_NAME` | AWSリージョン名 | `"ap-northeast-1"` |

## Parameter Store パラメータ

| パラメータ名 | 説明 | 例 |
|-------------|------|-----|
| `/cdx/dynamodb/answer_method_by_category_table_name` | 有人窓口情報DynamoDBテーブル名 | `"answer-method-by-category-table-dev"` |

---

## DynamoDBテーブル構造

### テーブル設計

- **テーブル**: 有人窓口情報テーブル（カテゴリ別回答方法テーブル）
- **リージョン**: `ap-northeast-1`
- **スキャン**: 全件取得（ページネーション対応）

### レコード例

DynamoDB形式:

```json
{
  "mannedCounterName": "経費精算窓口",
  "mannedCounterEmail": "expenses@example.com",
  "mannedCounterDescription": "経費精算に関する問合せ窓口です。"
}
```

レスポンス形式（snake_case変換後）:

```json
{
  "manned_counter_name": "経費精算窓口",
  "manned_counter_email": "expenses@example.com",
  "manned_counter_description": "経費精算に関する問合せ窓口です。"
}
```

---

## エラーハンドリング

### ロギング

- **INFO**: 正常処理、窓口情報の取得/マージログ
- **ERROR**: DynamoDBエラー、予期せぬエラー、スタックトレース

---

## 使用例

### ケース1: 優先窓口なしで全窓口を取得

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_manned_counter" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{}'
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
    "manned_counter_info": [
      {
        "manned_counter_name": "経費精算窓口",
        "manned_counter_email": "expenses@example.com",
        "manned_counter_description": "経費精算に関する問合せ窓口です。"
      },
      {
        "manned_counter_name": "IT問い合わせ窓口",
        "manned_counter_email": "it-helpdesk@example.com",
        "manned_counter_description": "ITに関する問合せ窓口です。"
      }
    ]
  }
}
```

**ポイント:**
- `priority_manned_counter_info` を指定しない場合、DynamoDBから取得した全窓口が返されます

---

### ケース2: 優先窓口を指定して取得

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_manned_counter" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "priority_manned_counter_names": [
      "事業所見学窓口",
      "VIマネジメント窓口"
    ],
    "company": "MMC"
  }'
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
    "manned_counter_info": [
      {
        "manned_counter_name": "事業所見学窓口",
        "manned_counter_email": "kengaku@example.com",
        "manned_counter_description": "事業所見学に関する問合せ窓口です。"
      },
      {
        "manned_counter_name": "VIマネジメント窓口",
        "manned_counter_email": "vi-management@example.com",
        "manned_counter_description": "VIマネジメントに関する問合せ窓口です。"
      },
      {
        "manned_counter_name": "経費精算窓口",
        "manned_counter_email": "expenses@example.com",
        "manned_counter_description": "経費精算に関する問合せ窓口です。"
      },
      {
        "manned_counter_name": "IT問い合わせ窓口",
        "manned_counter_email": "it-helpdesk@example.com",
        "manned_counter_description": "ITに関する問合せ窓口です。"
      }
    ]
  }
}
```

**ポイント:**
- 優先窓口（事業所見学、VIマネジメント）が先頭に配置されます
- その後にDynamoDBからの窓口（経費精算、IT問い合わせ）が続きます
- 優先窓口の順序はリクエストで指定した順序が保持されます

---

### ケース3: 会社コードと事業所コードでフィルタリング

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_manned_counter" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "company": "MMC",
    "office": "TOKYO"
  }'
```

**DynamoDBのデータ例:**
```json
[
  {
    "manned_counter_name": "全社共通窓口",
    "manned_counter_email": "all@example.com",
    "manned_counter_description": "全社共通窓口",
    "company_for_suggesting_manned_counter": ["ALLJPN"],
    "is_office_access_only": false
  },
  {
    "manned_counter_name": "MMC専用窓口",
    "manned_counter_email": "mmc@example.com",
    "manned_counter_description": "MMC専用窓口",
    "company_for_suggesting_manned_counter": ["MMC"],
    "is_office_access_only": false
  },
  {
    "manned_counter_name": "OTHER専用窓口",
    "manned_counter_email": "other@example.com",
    "manned_counter_description": "OTHER専用窓口",
    "company_for_suggesting_manned_counter": ["OTHER"],
    "is_office_access_only": false
  },
  {
    "manned_counter_name": "東京事業所専用窓口",
    "manned_counter_email": "tokyo@example.com",
    "manned_counter_description": "東京事業所専用窓口",
    "company_for_suggesting_manned_counter": ["ALLJPN"],
    "is_office_access_only": true,
    "office_for_suggesting_manned_counter": ["TOKYO"]
  },
  {
    "manned_counter_name": "空値窓口",
    "manned_counter_email": "empty@example.com",
    "manned_counter_description": "空値窓口",
    "company_for_suggesting_manned_counter": [],
    "is_office_access_only": false
  }
]
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
    "manned_counter_info": [
      {
        "manned_counter_name": "全社共通窓口",
        "manned_counter_email": "all@example.com",
        "manned_counter_description": "全社共通窓口"
      },
      {
        "manned_counter_name": "MMC専用窓口",
        "manned_counter_email": "mmc@example.com",
        "manned_counter_description": "MMC専用窓口"
      },
      {
        "manned_counter_name": "東京事業所専用窓口",
        "manned_counter_email": "tokyo@example.com",
        "manned_counter_description": "東京事業所専用窓口"
      }
    ]
  }
}
```

**ポイント:**
- `ALLJPN` は常に表示されます（全社共通窓口）
- `company: "MMC"` に一致するため、MMC専用窓口が表示されます
- `office: "TOKYO"` に一致し、かつ `is_office_access_only: true` のため、東京事業所専用窓口が表示されます
- `OTHER` 専用窓口は会社コードが一致しないため除外されます
- 空値窓口は会社コードが空値のため除外されます

---

### ケース4: 重複する窓口名の処理

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_manned_counter" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "priority_manned_counter_info": [
      {
        "manned_counter_name": "経費精算窓口",
        "manned_counter_email": "priority-expenses@example.com",
        "manned_counter_description": "優先的に表示する経費精算窓口です。"
      }
    ]
  }'
```

**DynamoDBのデータ例:**
```json
[
  {
    "manned_counter_name": "経費精算窓口",
    "manned_counter_email": "expenses@example.com",
    "manned_counter_description": "経費精算に関する問合せ窓口です。"
  },
  {
    "manned_counter_name": "IT問い合わせ窓口",
    "manned_counter_email": "it-helpdesk@example.com",
    "manned_counter_description": "ITに関する問合せ窓口です。"
  }
]
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
    "manned_counter_info": [
      {
        "manned_counter_name": "経費精算窓口",
        "manned_counter_email": "priority-expenses@example.com",
        "manned_counter_description": "優先的に表示する経費精算窓口です。"
      },
      {
        "manned_counter_name": "IT問い合わせ窓口",
        "manned_counter_email": "it-helpdesk@example.com",
        "manned_counter_description": "ITに関する問合せ窓口です。"
      }
    ]
  }
}
```

**ポイント:**
- 優先窓口の「経費精算窓口」が使用されます
- DynamoDBの「経費精算窓口」は重複として除外されます
- 窓口名（`manned_counter_name`）で重複判定が行われます

---

### ケース4: DynamoDBエラー

**レスポンス例:**

```json
{
  "statusCode": 500,
  "body": {
    "error": "有人窓口情報の取得に失敗しました",
    "details": "An error occurred (ResourceNotFoundException) when calling the Scan operation: Requested resource not found"
  }
}
```

**ポイント:**
- DynamoDBテーブルが存在しない場合や、アクセス権限がない場合にエラーが発生します

---

### Pythonクライアント

```python
import requests
import json

# 優先窓口なし
response = requests.post(
    "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_manned_counter",
    json={},
    headers={"x-apigw-api-id": "qsenl832o9"}
)

# 優先窓口あり
response = requests.post(
    "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_manned_counter",
    json={
        "priority_manned_counter_info": [
            {
                "manned_counter_name": "事業所見学窓口",
                "manned_counter_email": "kengaku@example.com",
                "manned_counter_description": "事業所見学に関する問合せ窓口です。"
            }
        ]
    },
    headers={"x-apigw-api-id": "qsenl832o9"}
)

# レスポンスパース
result = response.json()
body = json.loads(result["body"])
manned_counters = body.get("manned_counter_info", [])

if manned_counters:
    print(f"取得した窓口数: {len(manned_counters)}")
    for counter in manned_counters:
        print(f"- {counter['manned_counter_name']}: {counter['manned_counter_email']}")
else:
    print("窓口情報が見つかりませんでした")
```

### JavaScriptクライアント

```javascript
// 優先窓口なし
const response1 = await fetch(
  'https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_manned_counter',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-apigw-api-id': 'qsenl832o9'
    },
    body: JSON.stringify({})
  }
);

// 優先窓口あり
const response2 = await fetch(
  'https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/get_manned_counter',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-apigw-api-id': 'qsenl832o9'
    },
    body: JSON.stringify({
      priority_manned_counter_info: [
        {
          manned_counter_name: '事業所見学窓口',
          manned_counter_email: 'kengaku@example.com',
          manned_counter_description: '事業所見学に関する問合せ窓口です。'
        }
      ]
    })
  }
);

// レスポンスパース
const result = await response2.json();
const body = JSON.parse(result.body);
const mannedCounters = body.manned_counter_info;

if (mannedCounters && mannedCounters.length > 0) {
  console.log(`取得した窓口数: ${mannedCounters.length}`);
  mannedCounters.forEach(counter => {
    console.log(`- ${counter.manned_counter_name}: ${counter.manned_counter_email}`);
  });
} else {
  console.log('窓口情報が見つかりませんでした');
}
```

---

## テスト

### ユニットテスト実行

```bash
uv run pytest src/get_manned_counter/test/test_handler.py -v
```

### ローカルテスト実行

```bash
uv run python src/get_manned_counter/handler.py
```

**注意:** ローカルテストを実行する場合、以下が必要です:
- 実際のDynamoDBとParameter Storeにアクセス
- 環境変数 `ENV` と `REGION_NAME` の設定
- AWS認証情報の設定

---

## ユースケース

### 1. RAG検索結果からの有人接続

ユーザーがRAGシステムで質問を行い、自動回答できない場合に有人窓口の選択肢を提供。

- RAG検索で特定のカテゴリ（例: 経費精算）に関連することが判明
- そのカテゴリに対応する優先窓口情報を `priority_manned_counter_info` で指定
- APIを呼び出してマージされた窓口リストを取得
- ユーザーに窓口選択UIを表示

### 2. 全窓口一覧の表示

ユーザーが直接「有人窓口に問い合わせたい」と要求した場合。

- `priority_manned_counter_info` を空で指定
- APIを呼び出してDynamoDBの全窓口を取得
- ユーザーに全窓口リストを表示

### 3. コンテキストに応じた窓口の優先表示

ユーザーの問い合わせ内容に基づいて、関連性の高い窓口を優先表示。

- ユーザーの質問内容を解析
- 関連する窓口を `priority_manned_counter_info` で指定
- APIを呼び出してマージされた窓口リストを取得
- ユーザーに関連窓口を先頭に表示

---
