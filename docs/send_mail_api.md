# SESメール送信 API仕様書

## 概要

`src/send_ses2mail_dealer/handler.py` のLambda関数は、問い合わせ内容を受け取り、業務小分類に基づいた担当窓口へAWS SES経由でメールを送信します。

**エンドポイント:** `/v1/send-mail` (POST)

---

## 入力仕様

### リクエスト構造

```json
{
  "httpMethod": "POST",
  "path": "/send-mail",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    // リクエストパラメータ（JSON形式）
  }
}
```

**注意:** `body`フィールドは文字列または辞書形式で受け付けます。Base64エンコードされている場合は自動的にデコードされます。

### リクエストパラメータ

#### 必須パラメータ

| パラメータ              | 型        | 説明                                                               | 例                                         |
| ----------------------- | --------- | ------------------------------------------------------------------ | ------------------------------------------ |
| `questioner_email`      | `string`  | 問い合わせ者のメールアドレス（返信先）                             | `"user@example.com"`                       |
| `business_sub_category` | `string`  | 業務小分類（問い合わせカテゴリ）                                   | `"経費精算"`                               |
| `company_cd`            | `string`  | 会社コード                                                         | `"ALLJPN"`                                 |
| `office_cd`             | `string`  | 事業所コード                                                       | `"MM00"`                                   |
| `mail_content`          | `string`  | メール本文（問い合わせ内容）                                       | `"経費精算の期限について教えてください。"` |
| `manned_counter_email`  | `string`  | 有人窓口のメールアドレス（送信先）                                 | `"expenses@example.com"`                   |
| `is_office_access_only` | `boolean` | 事業所アクセス制限フラグ（メールタイトルに事業所コードを含めるか） | `true`                                     |

#### オプションパラメータ

| パラメータ  | 型              | デフォルト値 | 説明                 |
| ----------- | --------------- | ------------ | -------------------- |
| `mail_file` | `array[object]` | `null`       | 添付ファイルのリスト |

#### 添付ファイルオブジェクト (`mail_file`)

メール添付ファイルを送信する場合、以下の構造の配列を指定します:

```json
{
  "mail_file": [
    {
      "file_name": "document.pdf",
      "file_data": "base64encodedfiledata..."
    }
  ]
}
```

| フィールド  | 型       | 説明                                 |
| ----------- | -------- | ------------------------------------ |
| `file_name` | `string` | ファイル名（拡張子を含む）           |
| `file_data` | `string` | Base64エンコードされたファイルデータ |

---

## リクエスト例

### 最小構成（添付ファイルなし）

```json
{
  "questioner_email": "user@example.com",
  "company_cd": "ALLJPN",
  "office_cd": "MM00",
  "business_sub_category": "経費精算",
  "mail_content": "経費精算の期限について教えてください。\n\n承認フローについても確認したいです。",
  "manned_counter_email": "expenses@example.com",
  "is_office_access_only": true
}
```

### 添付ファイル付き

```json
{
  "questioner_email": "user@example.com",
  "business_sub_category": "経費精算",
  "company_cd": "ALLJPN",
  "office_cd": "MM00",
  "mail_content": "経費精算の申請書を添付しますので、確認をお願いします。",
  "manned_counter_email": "expenses@example.com",
  "is_office_access_only": true,
  "mail_file": [
    {
      "file_name": "expense_report.pdf",
      "file_data": "JVBERi0xLjQKJeLjz9MKMyAwIG9iago8PC9UeXBlIC9QYWdlCi9QYXJlbnQgMSAwIFIK..."
    },
    {
      "file_name": "receipt.jpg",
      "file_data": "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8..."
    }
  ]
}
```

### API Gateway経由（Base64エンコード）

```json
{
  "httpMethod": "POST",
  "path": "/send-mail",
  "headers": {
    "Content-Type": "application/json"
  },
  "isBase64Encoded": false,
  "body": "{\"questioner_email\":\"user@example.com\",\"business_sub_category\":\"経費精算\",\"company_cd\":\"ALLJPN\",\"office_cd\":\"MM00\",\"mail_content\":\"経費精算の期限について教えてください。\",\"manned_counter_email\":\"expenses@example.com\",\"is_office_access_only\":true}"
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
  "body": "{\"sent_text\": \"お問い合わせが完了しました\\n\\n後日、担当者からメール等でご連絡いたします。\\n5営業日以上連絡がない場合、再度新しいチャットからお問い合わせください。\"}"
}
```

#### レスポンスボディの構造

`body` をJSON.parseした結果:

```json
{
  "sent_text": "お問い合わせが完了しました\n\n後日、担当者からメール等でご連絡いたします。\n5営業日以上連絡がない場合、再度新しいチャットからお問い合わせください。"
}
```

| フィールド  | 型       | 説明                       |
| ----------- | -------- | -------------------------- |
| `sent_text` | `string` | ユーザーへの完了メッセージ |

### エラーレスポンス

#### 400 Bad Request: バリデーションエラー

必須パラメータが不足している場合、または型が正しくない場合:

```json
{
  "statusCode": 400,
  "body": "{\"error\": \"Lambda関数のアプリケーションコード実行時に想定されたエラーが発生しました。エラー内容：バリデーションエラー: Validation error: ...\"}"
}
```

#### 400 Bad Request: JSONパースエラー

リクエストボディのJSON形式が不正な場合:

```json
{
  "statusCode": 400,
  "body": "{\"error\": \"Lambda関数のアプリケーションコード実行時に想定されたエラーが発生しました。エラー内容：リクエストしたbodyの形式が正しくありません。エラー内容：...\"}"
}
```

#### 500 Internal Server Error: メール送信失敗

SESメール送信に失敗した場合:

```json
{
  "statusCode": 500,
  "body": "{\"error\": \"Lambda関数のアプリケーションコード実行時に想定されたエラーが発生しました。エラー内容：SESメール送信に失敗しました\"}"
}
```

#### 500 Internal Server Error: 予期せぬエラー

その他の予期せぬエラーが発生した場合:

```json
{
  "statusCode": 500,
  "body": "{\"error\": \"Lambda関数のアプリケーションコード実行時に予期せぬエラーが発生しました。エラー内容：...\"}"
}
```

---

## ステータスコード一覧

| コード | 説明             | 発生条件                                     |
| ------ | ---------------- | -------------------------------------------- |
| `200`  | 成功             | メール送信が正常に完了                       |
| `400`  | リクエストエラー | 必須パラメータ不足、型不正、JSONパースエラー |
| `500`  | サーバーエラー   | SES送信失敗、予期せぬエラー                  |

---

## ビジネスロジック

### 処理フロー

1. **リクエストパース**
   - `body`からパラメータを抽出
   - Base64エンコードされている場合はデコード
   - 文字列の場合はJSONパース

2. **バリデーション**
   - Pydanticモデル (`MailRequestModel`) による型チェック
   - 必須フィールドの存在確認
   - 添付ファイルの構造検証

3. **メールタイトル生成**
   - リクエストパラメータ`is_office_access_only`に基づいてタイトルを生成
   - `is_office_access_only = true` の場合:
     - 形式: `【ムラタヘルプ】{業務小分類}_{会社コード}_{事業所コード}`
     - 例: `【ムラタヘルプ】経費精算_ALLJPN_MM00`
   - `is_office_access_only = false` の場合:
     - 形式: `【ムラタヘルプ】{業務小分類}_{会社コード}`
     - 例: `【ムラタヘルプ】経費精算_ALLJPN`

4. **SESメール送信**
   - 送信先: `manned_counter_email`（リクエストパラメータから取得）
   - 送信元: Parameter Storeから取得 (`ses/from_address`)
   - 返信先: `questioner_email`（問い合わせ者）
   - 本文: `mail_content`
   - 添付ファイル: `mail_file`（Base64デコードして添付）

5. **レスポンス返却**
   - 成功時: 完了メッセージを返却
   - エラー時: エラーメッセージとスタックトレースをログ出力

### メールタイトルのロジック

リクエストパラメータ`is_office_access_only`フラグによって、メールタイトルに事業所コードを含めるかどうかが決まります:

- **`is_office_access_only = true`（事業所限定）**:
  - 事業所ごとに異なる担当者がいる場合
  - メールタイトルに事業所コードを含める
  - 例: 経費精算、勤怠管理など事業所ごとに窓口が異なる業務

- **`is_office_access_only = false`（全社共通）**:
  - 会社全体で共通の担当者がいる場合
  - メールタイトルに事業所コードを含めない
  - 例: IT問い合わせ、人事制度など全社共通の窓口がある業務

**注意**: この情報は通常、`automated_answer` APIのレスポンスから取得した`manned_counter_info`に含まれています。フロントエンドは`automated_answer`を呼び出して取得した`manned_counter_email`と`is_office_access_only`をこのAPIに渡すことで、DynamoDBへの重複クエリを避けることができます。

### 添付ファイルの処理

- Base64エンコードされたファイルデータをデコード
- MIMEエンコーディングで添付ファイルとしてメールに追加
- 複数ファイルの添付をサポート
- ファイル名と拡張子を保持

---

## 環境変数

| 変数名        | 説明            | 例                        |
| ------------- | --------------- | ------------------------- |
| `ENV`         | 実行環境        | `"dev"`, `"stg"`, `"prd"` |
| `REGION_NAME` | AWSリージョン名 | `"ap-northeast-1"`        |

## Parameter Store パラメータ

| パラメータ名            | 説明                    | 例                      |
| ----------------------- | ----------------------- | ----------------------- |
| `/cdx/ses/from_address` | SES送信元メールアドレス | `"noreply@example.com"` |

---

## バリデーション

### Pydanticモデル

`src/send_ses2mail_dealer/handler.py` で定義されているPydanticモデルを使用:

#### MailRequestModel

```python
class MailRequestModel(BaseModel):
    questioner_email: str
    business_sub_category: str
    company_cd: str
    office_cd: str
    mail_content: str
    manned_counter_email: str
    is_office_access_only: bool
    mail_file: list[MailFileModel] | None = None
```

#### MailFileModel

```python
class MailFileModel(BaseModel):
    file_name: str
    file_data: str
```

### バリデーションルール

- **必須フィールド**: 全てのフィールド（`mail_file`を除く）が必須
- **型チェック**: 各フィールドの型が正しいかチェック
- **添付ファイル**: `mail_file`が指定されている場合、各要素が`file_name`と`file_data`を持つことを確認

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

- **INFO**: 正常処理、メール送信成功、メールタイトル生成
- **ERROR**: バリデーションエラー、SES送信失敗、DynamoDBエラー、予期せぬエラー、スタックトレース

---

## 使用例

### ケース1: 基本的なメール送信（添付ファイルなし）

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/send-mail" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "questioner_email": "user@example.com",
    "business_sub_category": "経費精算",
    "company_cd": "ALLJPN",
    "office_cd": "MM00",
    "mail_content": "経費精算の期限について教えてください。",
    "manned_counter_email": "expenses@example.com",
    "is_office_access_only": true
  }'
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
    "sent_text": "お問い合わせが完了しました\n\n後日、担当者からメール等でご連絡いたします。\n5営業日以上連絡がない場合、再度新しいチャットからお問い合わせください。"
  }
}
```

**ポイント:**

- メールタイトル: `【ムラタヘルプ】経費精算_ALLJPN_MM00`（`is_office_access_only: true`のため事業所コード含む）
- 送信先: `expenses@example.com`
- 返信先: `user@example.com`

---

### ケース2: 添付ファイル付きメール送信

**リクエスト:**

```bash
# Base64エンコードされたファイルデータを準備
FILE_DATA=$(base64 -w 0 document.pdf)

curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/send-mail" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d "{
    \"questioner_email\": \"user@example.com\",
    \"business_sub_category\": \"経費精算\",
    \"company_cd\": \"ALLJPN\",
    \"office_cd\": \"MM00\",
    \"mail_content\": \"経費精算の申請書を添付しますので、確認をお願いします。\",
    \"manned_counter_email\": \"expenses@example.com\",
    \"is_office_access_only\": true,
    \"mail_file\": [{
      \"file_name\": \"expense_report.pdf\",
      \"file_data\": \"$FILE_DATA\"
    }]
  }"
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
    "sent_text": "お問い合わせが完了しました\n\n後日、担当者からメール等でご連絡いたします。\n5営業日以上連絡がない場合、再度新しいチャットからお問い合わせください。"
  }
}
```

**ポイント:**

- 添付ファイルはBase64エンコードして送信
- 複数ファイルの添付も可能（`mail_file`配列に追加）
- ファイル名は拡張子を含めて指定

---

### ケース3: 全社共通窓口へのメール送信（事業所コードなし）

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/send-mail" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "questioner_email": "user@example.com",
    "business_sub_category": "IT問い合わせ",
    "company_cd": "ALLJPN",
    "office_cd": "MM00",
    "mail_content": "VPN接続ができません。サポートをお願いします。",
    "manned_counter_email": "it-helpdesk@example.com",
    "is_office_access_only": false
  }'
```

**レスポンス:**

```json
{
  "statusCode": 200,
  "body": {
    "sent_text": "お問い合わせが完了しました\n\n後日、担当者からメール等でご連絡いたします。\n5営業日以上連絡がない場合、再度新しいチャットからお問い合わせください。"
  }
}
```

**ポイント:**

- メールタイトル: `【ムラタヘルプ】IT問い合わせ_ALLJPN`（`is_office_access_only: false`のため事業所コード含まない）
- 全社共通窓口への問い合わせでは`is_office_access_only: false`を指定

---

### ケース4: 必須フィールド不足エラー

**リクエスト:**

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/send-mail" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "questioner_email": "user@example.com",
    "business_sub_category": "経費精算",
    "company_cd": "ALLJPN",
    "office_cd": "MM00",
    "manned_counter_email": "expenses@example.com",
    "is_office_access_only": true
  }'
```

**レスポンス:**

```json
{
  "statusCode": 400,
  "body": {
    "error": "Lambda関数のアプリケーションコード実行時に想定されたエラーが発生しました。エラー内容：バリデーションエラー: Validation error: 1 validation error for MailRequestModel\nmail_content\n  Field required [type=missing, ...]"
  }
}
```

**ポイント:**

- `mail_content`フィールドが不足しているためバリデーションエラー
- 全ての必須フィールドを指定する必要がある

---

### ケース5: SESメール送信失敗

**レスポンス例:**

```json
{
  "statusCode": 500,
  "body": {
    "error": "Lambda関数のアプリケーションコード実行時に想定されたエラーが発生しました。エラー内容：SESメール送信に失敗しました"
  }
}
```

**ポイント:**

- AWS SESのメール送信処理が失敗した場合
- 送信元メールアドレスの検証状態やSES制限を確認

---

### Pythonクライアント

```python
import requests
import json
import base64

# 添付ファイルなし
response = requests.post(
    "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/send-mail",
    json={
        "questioner_email": "user@example.com",
        "business_sub_category": "経費精算",
        "company_cd": "ALLJPN",
        "office_cd": "MM00",
        "mail_content": "経費精算の期限について教えてください。",
        "manned_counter_email": "expenses@example.com",
        "is_office_access_only": True
    },
    headers={"x-apigw-api-id": "qsenl832o9"}
)

# 添付ファイル付き
with open("document.pdf", "rb") as f:
    file_data = base64.b64encode(f.read()).decode("utf-8")

response = requests.post(
    "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/send-mail",
    json={
        "questioner_email": "user@example.com",
        "business_sub_category": "経費精算",
        "company_cd": "ALLJPN",
        "office_cd": "MM00",
        "mail_content": "経費精算の申請書を添付します。",
        "manned_counter_email": "expenses@example.com",
        "is_office_access_only": True,
        "mail_file": [
            {
                "file_name": "document.pdf",
                "file_data": file_data
            }
        ]
    },
    headers={"x-apigw-api-id": "qsenl832o9"}
)

# レスポンスパース
result = response.json()
if result["statusCode"] == 200:
    body = json.loads(result["body"])
    print(body["sent_text"])
else:
    body = json.loads(result["body"])
    print(f"エラー: {body['error']}")
```

### JavaScriptクライアント

```javascript
// 添付ファイルなし
const response = await fetch(
  'https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/send-mail',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-apigw-api-id': 'qsenl832o9',
    },
    body: JSON.stringify({
      questioner_email: 'user@example.com',
      business_sub_category: '経費精算',
      company_cd: 'ALLJPN',
      office_cd: 'MM00',
      mail_content: '経費精算の期限について教えてください。',
      manned_counter_email: 'expenses@example.com',
      is_office_access_only: true,
    }),
  }
);

// 添付ファイル付き
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];
const reader = new FileReader();

reader.onload = async function (e) {
  const base64Data = btoa(
    new Uint8Array(e.target.result).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ''
    )
  );

  const response = await fetch(
    'https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/send-mail',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-apigw-api-id': 'qsenl832o9',
      },
      body: JSON.stringify({
        questioner_email: 'user@example.com',
        business_sub_category: '経費精算',
        company_cd: 'ALLJPN',
        office_cd: 'MM00',
        mail_content: '経費精算の申請書を添付します。',
        manned_counter_email: 'expenses@example.com',
        is_office_access_only: true,
        mail_file: [
          {
            file_name: file.name,
            file_data: base64Data,
          },
        ],
      }),
    }
  );

  const result = await response.json();
  const body = JSON.parse(result.body);

  if (result.statusCode === 200) {
    console.log(body.sent_text);
  } else {
    console.error('エラー:', body.error);
  }
};

reader.readAsArrayBuffer(file);
```

---

## SESメール送信の仕様

### MIMEメール構造

- **Subject**: 業務小分類に基づいたメールタイトル
- **From**: Parameter Storeから取得した送信元アドレス
- **To**: DynamoDBから取得した担当窓口アドレス
- **Reply-To**: 問い合わせ者のメールアドレス（`questioner_email`）
- **Body**: プレーンテキスト形式（UTF-8エンコード）
- **Attachments**: Base64デコードされた添付ファイル

### メール送信先

| 宛先種別 | フィールド             | 説明                                         |
| -------- | ---------------------- | -------------------------------------------- |
| To       | `manned_counter_email` | 業務小分類の担当窓口（リクエストパラメータ） |
| Reply-To | `questioner_email`     | 問い合わせ者（リクエストパラメータ）         |

**注意:** 問い合わせ者にはCc/Bccで送信されません。返信先としてのみ指定されます。

---

## テスト

### ユニットテスト実行

```bash
uv run pytest src/send_ses2mail_dealer/test/test_handler.py -v
```

### カバレッジ確認

```bash
uv run pytest src/send_ses2mail_dealer/test/test_handler.py --cov=src/send_ses2mail_dealer --cov-report=html
```

---

## 関連ファイル

- **Lambda ハンドラー**: `src/send_ses2mail_dealer/handler.py`（バリデーションモデルを含む）
- **テストコード**: `src/send_ses2mail_dealer/test/test_handler.py`
- **AWS SDK ユーティリティ**: `src/common/aws_utils.py`
- **共通エラークラス**: `src/common/errors.py`
- **パラメータローダー**: `src/common/parameter_loader.py`

---

## セキュリティ考慮事項

### メールアドレスの検証

- 現在の実装では、メールアドレス形式の厳密なバリデーションは行われていません
- Pydanticの基本的な型チェックのみ実施
- 本番環境では、EmailStrなどを使用した厳密なバリデーションを推奨

### 添付ファイルのサイズ制限

- SESの制限: メール全体で10MB
- 複数ファイルの合計サイズに注意
- 大容量ファイルはS3経由での共有を推奨

### スパム対策

- Reply-Toヘッダーを使用して問い合わせ者への返信を可能に
- 送信元アドレスは固定（Parameter Storeで管理）

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| 2025-12-09 | 1.0.0      | 初版作成 |
