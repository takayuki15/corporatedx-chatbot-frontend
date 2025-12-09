# チャット履歴のlocalStorage管理

## 概要

チャット履歴をブラウザのlocalStorageで永続化し、ページリロード後も履歴を復元できるようにしました。

## 実装詳細

### localStorage のキー形式

```
message_[session_id]
```

例: `message_c3d4e5f6-a7b8-9012-cdef-123456789012`

### 保存データ形式

各セッションIDに対して、`RagResponse[]`の配列をJSON形式で保存します。

```json
[
  {
    "session_id": "xxx",
    "chat_history": [...],
    "business_sub_categories": [...],
    "rag_answer": "...",
    "rag_source_files": [...],
    ...
  },
  ...
]
```

## 主な機能

### 1. チャット履歴の保存 (`saveChatHistory`)

メッセージ送信後、自動的にlocalStorageに保存されます。

```typescript
// useRagChat.ts内で自動実行
saveChatHistory(data.session_id, updatedMessages);
```

### 2. チャット履歴の読み込み (`loadChatHistory`)

session_idが変更されたとき、localStorageから履歴を読み込みます。

```typescript
// useRagChat.ts内で自動実行
const savedMessages = loadChatHistory(state.sessionId);
```

### 3. チャット履歴の削除 (`deleteChatHistory`)

チャット履歴をクリアしたとき、localStorageからも削除されます。

```typescript
// clearMessages()を呼び出すと実行
deleteChatHistory(state.sessionId);
```

### 4. 全セッションIDの取得 (`getAllSessionIds`)

将来的なチャット履歴一覧表示のために、すべてのセッションIDを取得できます。

```typescript
const sessionIds = getAllSessionIds();
// ["session-1", "session-2", "session-3"]
```

## ファイル構成

```
src/
├── lib/
│   └── storage.ts          # localStorageユーティリティ
├── hooks/
│   └── useRagChat.ts       # localStorage統合済みチャットフック
└── docs/
    └── chat_history_storage.md  # このドキュメント
```

## 使用方法

### 基本的な使い方

```typescript
import { useRagChat } from '@/hooks';

function ChatComponent() {
  const { messages, sendMessage, clearMessages } = useRagChat();

  // メッセージ送信（自動的にlocalStorageに保存）
  await sendMessage('質問内容');

  // チャット履歴クリア（localStorageからも削除）
  clearMessages();

  return <div>{/* ... */}</div>;
}
```

### 過去のセッション一覧取得

```typescript
import { getAllSessionIds, loadChatHistory } from '@/lib/storage';

// すべてのセッションIDを取得
const sessionIds = getAllSessionIds();

// 各セッションの履歴を読み込み
sessionIds.forEach(sessionId => {
  const messages = loadChatHistory(sessionId);
  console.log(`Session ${sessionId}:`, messages);
});
```

## 注意事項

### localStorageの容量制限

- ブラウザのlocalStorageは通常5-10MB程度の制限があります
- 大量のチャット履歴を保存すると制限に達する可能性があります
- 必要に応じて古いセッションを削除する機能の追加を検討してください

### プライバシーとセキュリティ

- localStorageはクライアント側に平文で保存されます
- 機密情報を含むチャット履歴は適切に管理してください
- 必要に応じて暗号化の実装を検討してください

### ブラウザ互換性

- localStorage APIは主要ブラウザでサポートされています
- プライベートブラウジングモードでは制限がある場合があります
- エラーハンドリングを実装済みです

## TODO

- [ ] メッセージごとのタイムスタンプ追加
- [ ] セッション一覧表示UI実装
- [ ] 古いセッションの自動削除機能
- [ ] チャット履歴のエクスポート/インポート機能
- [ ] localStorageの容量管理機能
