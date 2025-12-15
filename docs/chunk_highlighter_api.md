# チャンクハイライトシステム API仕様書

## 概要

`src/chunk_highlighter/handler.py` のLambda関数は、RAGシステムで取得したドキュメントチャンクを元のMarkdownファイル内でハイライトし、HTMLとして返却します。

**エンドポイント:** `/v1/chunk_highlighter` (POST)

---

## 入力仕様

### リクエスト構造

```json
{
  "httpMethod": "POST",
  "path": "/v1/chunk_highlighter",
  "headers": {
    "Content-Type": "application/json",
    "x-apigw-api-id": "qsenl832o9"
  },
  "body": {
    // リクエストパラメータ（JSON形式）
  }
}
```

### リクエストパラメータ

#### 必須パラメータ

| パラメータ         | 型              | 説明                                     | 制約                                            |
| ------------------ | --------------- | ---------------------------------------- | ----------------------------------------------- |
| `source_file_list` | `array<string>` | S3上のMarkdownファイルパスのリスト       | `chunk_list` と要素数が一致する必要がある       |
| `chunk_list`       | `array<string>` | ハイライト対象のチャンクテキストのリスト | `source_file_list` と要素数が一致する必要がある |

**重要な制約:**

- `source_file_list` と `chunk_list` の要素数は**必ず一致**している必要があります
- 各インデックスで対応関係があります（`source_file_list[i]` のファイル内で `chunk_list[i]` をハイライト）

---

## リクエスト例

### 基本的なリクエスト

```json
{
  "source_file_list": [
    "markdown/mmc/mm00/keiri/経費精算ガイド.md",
    "markdown/alljpn/soumu/社内規定.md"
  ],
  "chunk_list": [
    "経費精算の申請期限は、毎月末日までに前月分を提出してください。",
    "年次有給休暇は入社後6ヶ月経過時点で付与されます。"
  ]
}
```

### 単一ファイルのリクエスト

```json
{
  "source_file_list": ["markdown/mmc/mm00/it/VPN接続手順.md"],
  "chunk_list": [
    "VPN接続には専用のクライアントソフトウェアが必要です。社内ポータルからダウンロードしてください。"
  ]
}
```

---

## 出力仕様

### 成功レスポンス (200 OK)

```json
{
  "statusCode": 200,
  "body": {
    "s3_path": [
      "markdown/mmc/mm00/keiri/経費精算ガイド.md",
      "markdown/alljpn/soumu/社内規定.md"
    ],
    "html": [
      "<html><body><h1>経費精算ガイド</h1><p>経費精算の申請期限は、<mark>毎月末日までに前月分を提出してください。</mark></p></body></html>",
      "<html><body><h1>社内規定</h1><p>年次有給休暇は<mark>入社後6ヶ月経過時点で付与されます。</mark></p></body></html>"
    ]
  }
}
```

#### レスポンスフィールド

| フィールド | 型              | 説明                                                                 |
| ---------- | --------------- | -------------------------------------------------------------------- |
| `s3_path`  | `array<string>` | 参照したMarkdownファイルのS3パスリスト（リクエストと同じ順序）       |
| `html`     | `array<string>` | ハイライト処理済みHTMLのリスト（各要素がリクエストのチャンクに対応） |

---

## 処理フロー

### 1. リクエストのバリデーション

- 必須フィールド（`source_file_list`, `chunk_list`）の存在確認
- 両配列の要素数が一致しているかを検証

### 2. 各ファイルの処理

各 `(source_file, chunk)` ペアに対して以下を実行：

#### a. ファイルサイズチェック

- S3からファイルサイズを取得
- **500KB以下**: 次のステップへ進む
- **500KB超過**: チャンクをそのままHTMLラップして返却
  ```html
  <html>
    <body>
      {chunk}
    </body>
  </html>
  ```

#### b. Markdownファイルの取得とハイライト

1. S3からMarkdownファイルを取得
2. テキスト正規化処理：
   - BOM除去
   - 画像記法削除 (`![](data:image/...)`)
   - エスケープシーケンスの変換
   - 空白・改行の正規化
   - HTMLタグの削除
3. チャンクマッチング（あいまい検索）：
   - `difflib.SequenceMatcher` を使用
   - 類似度 85% 以上でマッチと判定
4. マッチした部分を `<mark>` タグでハイライト
5. MarkdownをHTMLに変換

#### c. エラーハンドリング

- ファイル取得失敗やハイライト処理エラー時：
  ```html
  <p style="color:red;">
    Error fetching or processing {source_file}: {error_message}
  </p>
  ```

### 3. レスポンスサイズチェック

- 組み立てたレスポンスのバイト数を測定
- **6MB以下**: そのまま返却
- **6MB超過**: フォールバック処理を実行
  - HTMLの代わりにチャンクをHTMLラップしたものを返却
  - 警告ログを出力

---

## エラーレスポンス

### 400 Bad Request - JSONパースエラー

```json
{
  "statusCode": 400,
  "body": {
    "error": "Invalid JSON in event body",
    "detail": "Expecting value: line 1 column 1 (char 0)"
  }
}
```

### 400 Bad Request - バリデーションエラー

```json
{
  "statusCode": 400,
  "body": {
    "error": "chunk_listとsource_file_listの要素数が一致していません。 chunk_list:3 source_file_list:2"
  }
}
```

### 400 Bad Request - 必須フィールド不足

```json
{
  "statusCode": 400,
  "body": {
    "error": "Validation error: 1 validation error for RequestModel\nchunk_list\n  Field required [type=missing, input_value={'source_file_list': [...]}, input_type=dict]"
  }
}
```

---

## 実装例

### Python (requests)

```python
import requests

url = "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/chunk_highlighter"

payload = {
    "source_file_list": [
        "markdown/mmc/mm00/keiri/経費精算ガイド.md",
        "markdown/alljpn/soumu/社内規定.md"
    ],
    "chunk_list": [
        "経費精算の申請期限は、毎月末日までに前月分を提出してください。",
        "年次有給休暇は入社後6ヶ月経過時点で付与されます。"
    ]
}

response = requests.post(
    url,
    json=payload,
    headers={"x-apigw-api-id": "qsenl832o9"}
)

if response.status_code == 200:
    result = response.json()
    for s3_path, html in zip(result["s3_path"], result["html"]):
        print(f"File: {s3_path}")
        print(f"HTML: {html[:100]}...")  # 最初の100文字を表示
else:
    print(f"Error: {response.status_code}")
    print(response.json())
```

### JavaScript (fetch)

```javascript
const url =
  'https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/chunk_highlighter';

const payload = {
  source_file_list: [
    'markdown/mmc/mm00/keiri/経費精算ガイド.md',
    'markdown/alljpn/soumu/社内規定.md',
  ],
  chunk_list: [
    '経費精算の申請期限は、毎月末日までに前月分を提出してください。',
    '年次有給休暇は入社後6ヶ月経過時点で付与されます。',
  ],
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-apigw-api-id': 'qsenl832o9',
  },
  body: JSON.stringify(payload),
})
  .then(response => response.json())
  .then(data => {
    data.s3_path.forEach((path, index) => {
      console.log(`File: ${path}`);
      console.log(`HTML: ${data.html[index].substring(0, 100)}...`);
    });
  })
  .catch(error => console.error('Error:', error));
```

### cURL

```bash
curl -v "https://vpce-0aa3dde88309d3434-xk69w2m8.execute-api.ap-northeast-1.vpce.amazonaws.com/v1/chunk_highlighter" \
  -H 'x-apigw-api-id: qsenl832o9' \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "source_file_list": [
      "markdown/mmc/mm00/keiri/経費精算ガイド.md"
    ],
    "chunk_list": [
      "経費精算の申請期限は、毎月末日までに前月分を提出してください。"
    ]
  }'
```

---

## 技術仕様

### ハイライト処理の詳細

#### テキスト正規化

以下の正規化処理により、チャンクマッチングの精度を向上：

1. **BOM除去**: `\ufeff` を削除
2. **画像記法削除**: `![](data:image/...)` パターンを削除
3. **エスケープシーケンス変換**: `\n`, `\t`, `\'`, `\"`, `\\` を実際の文字に変換
4. **配列/JSON記法の調整**: 連続する引用符とカンマを正規化
5. **空白正規化**: 連続する空白・改行・タブを単一スペースに変換
6. **記号揺れの調整**: `..` → `.`, `. .` → `.`
7. **HTMLタグ削除**: `<tag>` パターンを削除

#### あいまいマッチング

- `difflib.SequenceMatcher` を使用した類似度計算
- **マッチ閾値**: 85% 以上
- 正規化後のテキストで比較を実行
- 最も類似度の高い箇所を特定してハイライト

#### HTMLハイライト

- マッチした部分を `<mark>` タグで囲む
- Markdownを `markdown` ライブラリでHTMLに変換
- 最終的なHTML構造：
  ```html
  <html>
    <body>
      <!-- Markdownから変換されたHTML -->
      <p>通常のテキスト<mark>ハイライトされたチャンク</mark>残りのテキスト</p>
    </body>
  </html>
  ```

### サイズ制限

| 制限項目               | 制限値 | 動作                                                 |
| ---------------------- | ------ | ---------------------------------------------------- |
| Markdownファイルサイズ | 500KB  | 超過時はチャンクをそのままHTMLラップ                 |
| レスポンスペイロード   | 6MB    | 超過時はハイライト処理をスキップしてチャンクのみ返却 |

これらの制限は AWS Lambda の同期呼び出し制限（6MB）に基づいています。

### AWS リソース

- **S3バケット**: Parameter Store から取得（`s3/indexer_tmp_bucket_name`）
- **Lambda実行時間**: タイムアウトは環境に応じて設定
- **メモリ**: ファイルサイズとチャンク数に応じて適切に設定

---

## ユースケース

### 1. RAG検索結果のハイライト表示

ユーザーがRAGシステムで質問を行った際、取得したチャンクを元のドキュメント内で強調表示してコンテキストを提供。

```json
{
  "source_file_list": ["markdown/mmc/mm00/faq/VPN.md"],
  "chunk_list": ["VPN接続には専用のクライアントソフトウェアが必要です。"]
}
```

### 2. 複数ドキュメントの一括ハイライト

複数のドキュメントから取得した複数のチャンクを一度にハイライト処理。

```json
{
  "source_file_list": [
    "markdown/doc1.md",
    "markdown/doc2.md",
    "markdown/doc3.md"
  ],
  "chunk_list": [
    "チャンク1のテキスト",
    "チャンク2のテキスト",
    "チャンク3のテキスト"
  ]
}
```

### 3. エラーハンドリングの確認

存在しないファイルやアクセス権限のないファイルに対するリクエスト時のエラーメッセージ確認。

---

## トラブルシューティング

### よくあるエラーと対処法

#### エラー: "chunk_listとsource_file_listの要素数が一致していません"

**原因**: リクエストパラメータの配列長が異なる

**対処法**: 両配列の要素数を一致させる

```json
// ❌ 誤り
{
  "source_file_list": ["file1.md", "file2.md"],
  "chunk_list": ["chunk1"]
}

// ✅ 正しい
{
  "source_file_list": ["file1.md", "file2.md"],
  "chunk_list": ["chunk1", "chunk2"]
}
```

#### エラー: "Invalid JSON in event body"

**原因**: JSON形式が不正

**対処法**: JSONの構文を確認（カンマ、引用符、括弧の対応など）

#### 警告: "Response size exceeds 6MB bytes"

**原因**: レスポンスサイズがLambda制限を超過

**対処法**:

- リクエストのチャンク数を減らす
- 複数回のリクエストに分割する
- この場合、システムは自動的にフォールバック処理を実行（チャンクをHTMLラップして返却）

---

## ベストプラクティス

### パフォーマンス最適化

1. **バッチ処理**: 可能な限り複数のチャンクを1回のリクエストにまとめる
2. **ファイルサイズ確認**: 500KBを超える大きなファイルは事前に分割を検討
3. **並行処理**: 複数の独立したハイライトリクエストは並行実行可能

### エラーハンドリング

1. **レスポンスコードの確認**: 必ず `statusCode` を確認
2. **部分的なエラー**: 個別のチャンクのハイライトが失敗しても、他のチャンクは正常に処理される
3. **ログの活用**: CloudWatch Logs でエラーの詳細を確認

### セキュリティ

1. **S3アクセス権限**: Lambda関数が適切なS3バケットアクセス権限を持つことを確認
2. **API認証**: API Gateway で適切な認証・認可を設定
3. **入力検証**: アプリケーション側でも入力値の妥当性を確認

---

## 付録

### レスポンス例（フォールバック処理）

500KB超過のファイルまたは6MB超過のレスポンス時：

```json
{
  "statusCode": 200,
  "body": {
    "s3_path": ["markdown/large-file.md"],
    "html": [
      "<html>経費精算の申請期限は、毎月末日までに前月分を提出してください。</html>"
    ]
  }
}
```

### レスポンス例（エラー発生時）

```json
{
  "statusCode": 200,
  "body": {
    "s3_path": ["markdown/missing-file.md"],
    "html": [
      "<p style='color:red;'>Error fetching or processing markdown/missing-file.md: The specified key does not exist.</p>"
    ]
  }
}
```
