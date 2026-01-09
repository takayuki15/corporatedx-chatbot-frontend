'use client';

import RelatedFAQ from '@/components/common/RelatedFAQ';
import type { RagResponse } from '@/lib/api';
import { saveChatHistory } from '@/lib/storage';
import { ThumbDownOutlined, ThumbUpOutlined } from '@mui/icons-material';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import type { Citation } from './CitationPopover';
import CitationText from './CitationText';

interface ChatMessageProps {
  response: RagResponse;
  allMessages?: RagResponse[];
}

/**
 * RAG回答テキストを引用付きで表示するためのコンポーネントを生成
 */
function RagAnswerWithCitations({
  ragAnswer,
  ragSourceFiles,
  ragSourceTexts,
}: {
  ragAnswer: string;
  ragSourceFiles?: string[];
  ragSourceTexts?: string[];
}) {
  // 引用マーカー [1], [2] などをパースして、CitationTextコンポーネントに変換
  const renderTextWithCitations = () => {
    if (!ragSourceFiles || ragSourceFiles.length === 0) {
      return (
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {ragAnswer}
        </Typography>
      );
    }

    // 引用マーカー [数字] を検出する正規表現
    const citationPattern = /\[(\d+)\]/g;
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = citationPattern.exec(ragAnswer)) !== null) {
      const citationIndex = parseInt(match[1], 10) - 1; // 1-indexed → 0-indexed

      // マーカーの前のテキスト
      if (match.index > lastIndex) {
        parts.push(ragAnswer.substring(lastIndex, match.index));
      }

      // 引用が有効な範囲内の場合
      if (citationIndex >= 0 && citationIndex < ragSourceFiles.length) {
        const citation: Citation = {
          id: `rag-citation-${citationIndex}`,
          title: ragSourceFiles[citationIndex],
          file_name: ragSourceFiles[citationIndex],
          description: ragSourceTexts?.[citationIndex] || undefined,
        };

        parts.push(
          <CitationText
            key={`citation-${citationIndex}-${match.index}`}
            text=""
            citation={citation}
          />
        );
      } else {
        // インデックスが範囲外の場合はそのまま表示
        parts.push(match[0]);
      }

      lastIndex = match.index + match[0].length;
    }

    // 残りのテキスト
    if (lastIndex < ragAnswer.length) {
      parts.push(ragAnswer.substring(lastIndex));
    }

    return (
      <Typography
        variant="body1"
        component="div"
        sx={{ whiteSpace: 'pre-wrap' }}
      >
        {parts.map((part, index) =>
          typeof part === 'string' ? part : <span key={index}>{part}</span>
        )}
      </Typography>
    );
  };

  return <>{renderTextWithCitations()}</>;
}

/**
 * AI回答のフィードバックボタン
 */
function FeedbackButtons({
  sessionId,
  conversationTime,
  initialFeedback,
  onFeedbackChange,
}: {
  sessionId: string;
  conversationTime?: string;
  initialFeedback?: 'good' | 'bad';
  onFeedbackChange?: (feedback: 'good' | 'bad' | undefined) => void;
}) {
  const [selectedFeedback, setSelectedFeedback] = useState<
    'good' | 'bad' | null
  >(initialFeedback || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoodClick = async () => {
    if (isSubmitting || !conversationTime) return;

    setIsSubmitting(true);
    try {
      // 既に選択されている場合は削除
      if (selectedFeedback === 'good') {
        const response = await fetch('/chatbot/api/delete-feedback/', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            conversation_time: conversationTime,
          }),
        });

        if (response.ok) {
          setSelectedFeedback(null);
          onFeedbackChange?.(undefined);
        } else {
          console.error('Failed to delete feedback');
        }
      } else {
        // 新規に選択
        const response = await fetch('/chatbot/api/submit-feedback/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            conversation_time: conversationTime,
            feedback: 'good',
          }),
        });

        if (response.ok) {
          setSelectedFeedback('good');
          onFeedbackChange?.('good');
        } else {
          console.error('Failed to submit good feedback');
        }
      }
    } catch (error) {
      console.error('Error handling good feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBadClick = async () => {
    if (isSubmitting || !conversationTime) return;

    setIsSubmitting(true);
    try {
      // 既に選択されている場合は削除
      if (selectedFeedback === 'bad') {
        const response = await fetch('/chatbot/api/delete-feedback/', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            conversation_time: conversationTime,
          }),
        });

        if (response.ok) {
          setSelectedFeedback(null);
          onFeedbackChange?.(undefined);
        } else {
          console.error('Failed to delete feedback');
        }
      } else {
        // 新規に選択
        const response = await fetch('/chatbot/api/submit-feedback/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            conversation_time: conversationTime,
            feedback: 'bad',
          }),
        });

        if (response.ok) {
          setSelectedFeedback('bad');
          onFeedbackChange?.('bad');
        } else {
          console.error('Failed to submit bad feedback');
        }
      }
    } catch (error) {
      console.error('Error handling bad feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
      <IconButton
        size="small"
        onClick={handleGoodClick}
        disabled={isSubmitting || (selectedFeedback !== null && selectedFeedback !== 'good')}
        sx={{
          color:
            selectedFeedback === 'good' ? 'success.main' : 'text.secondary',
          bgcolor:
            selectedFeedback === 'good' ? 'success.lighter' : 'transparent',
          '&:hover': {
            color: 'success.main',
            bgcolor: 'success.lighter',
          },
          '&.Mui-disabled': {
            color:
              selectedFeedback === 'good' ? 'success.main' : 'text.secondary',
            bgcolor:
              selectedFeedback === 'good' ? 'success.lighter' : 'transparent',
          },
        }}
        aria-label="Good feedback"
      >
        <ThumbUpOutlined fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={handleBadClick}
        disabled={isSubmitting || (selectedFeedback !== null && selectedFeedback !== 'bad')}
        sx={{
          color: selectedFeedback === 'bad' ? 'error.main' : 'text.secondary',
          bgcolor: selectedFeedback === 'bad' ? 'error.lighter' : 'transparent',
          '&:hover': {
            color: 'error.main',
            bgcolor: 'error.lighter',
          },
          '&.Mui-disabled': {
            color: selectedFeedback === 'bad' ? 'error.main' : 'text.secondary',
            bgcolor:
              selectedFeedback === 'bad' ? 'error.lighter' : 'transparent',
          },
        }}
        aria-label="Bad feedback"
      >
        <ThumbDownOutlined fontSize="small" />
      </IconButton>
    </Box>
  );
}

/**
 * タイムスタンプをフォーマット
 * 本日: 時間のみ (HH:MM)
 * 昨日以前: 日付と時間 (M/D HH:MM)
 */
function formatTimestamp(timestamp?: string): string {
  const messageDate = timestamp ? new Date(timestamp) : new Date();
  const today = new Date();

  // 本日かどうかを判定（年月日が一致）
  const isToday =
    messageDate.getFullYear() === today.getFullYear() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getDate() === today.getDate();

  if (isToday) {
    // 本日: 時間のみ表示
    return messageDate.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else {
    // 昨日以前: 日付と時間を表示
    return messageDate.toLocaleString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

/**
 * チャットメッセージ表示コンポーネント
 * RAGレスポンスの各パターンに対応した表示を行う
 */
export default function ChatMessage({
  response,
  allMessages,
}: ChatMessageProps) {
  // conversation_timeがない場合は生成
  const conversationTime =
    response.conversation_time ||
    (() => {
      const timestamp = response.timestamp || new Date().toISOString();
      const date = new Date(timestamp);
      const jstTime = new Date(date.getTime() + 9 * 60 * 60 * 1000);
      const formattedTime = jstTime.toISOString().replace('Z', '+09:00');
      const uuid = crypto.randomUUID();
      return `${formattedTime}_${uuid}`;
    })();

  // ユーザーメッセージを取得
  // フロントエンド側で追加したuserQueryを優先、なければchat_historyから取得
  const userMessage =
    response.userQuery ||
    response.chat_history.filter(msg => msg.role === 'user').pop()?.content;

  // タイムスタンプをフォーマット
  const timestamp = formatTimestamp(response.timestamp);

  // フィードバック変更時のハンドラー
  const handleFeedbackChange = (feedback: 'good' | 'bad' | undefined) => {
    if (!allMessages) return;

    // 現在のメッセージのインデックスを見つける
    const messageIndex = allMessages.findIndex(
      msg =>
        (msg.conversation_time || msg.timestamp) ===
        (conversationTime || response.timestamp)
    );

    if (messageIndex === -1) return;

    // メッセージのフィードバックを更新
    const updatedMessages = [...allMessages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      conversation_time: conversationTime,
      feedback,
    };

    // localStorageに保存
    saveChatHistory(response.session_id, updatedMessages, response.status);
  };

  // パターン1: インデックス不在
  const isNoIndexAvailable =
    'no_index_available' in response && response.no_index_available;

  // パターン2: 関連FAQのみ
  const hasFaqOnly = 'faq' in response && !('rag' in response);

  // パターン3: RAG回答のみ
  const hasRagOnly = 'rag' in response && !('faq' in response);

  // パターン4: FAQ + RAG両方
  const hasBoth = 'faq' in response && 'rag' in response;

  return (
    <Box sx={{ mb: 4 }}>
      {/* ユーザーメッセージ */}
      {userMessage && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            mb: 2,
          }}
        >
          <Paper
            elevation={1}
            sx={{
              maxWidth: '70%',
              p: 2,
              bgcolor: '#6E41FF',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Typography variant="body1">{userMessage}</Typography>
          </Paper>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', mt: 0.5 }}
          >
            {timestamp}
          </Typography>
        </Box>
      )}

      {/* アシスタントレスポンス */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Paper
          elevation={0}
          sx={{
            maxWidth: '85%',
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          {/* パターン1: インデックス不在 */}
          {isNoIndexAvailable && (
            <Typography variant="body1" color="text.secondary">
              {response.message}
            </Typography>
          )}

          {/* パターン2: 関連FAQのみ */}
          {hasFaqOnly && 'faq' in response && (
            <>
              <RelatedFAQ
                faqAnswers={response.faq.answer}
                faqSourceTexts={response.faq.source_texts}
                faqSourceFiles={response.faq.source_files}
                title="関連FAQ"
              />
              <Typography variant="body2" sx={{ mt: 2 }}>
                解決できない場合は、もう少し具体的に質問するとより適切に回答できるかもしれません。
              </Typography>
              <FeedbackButtons
                sessionId={response.session_id}
                conversationTime={conversationTime}
                initialFeedback={response.feedback}
                onFeedbackChange={handleFeedbackChange}
              />
            </>
          )}

          {/* パターン3: RAG回答のみ */}
          {hasRagOnly && 'rag' in response && (
            <Box>
              <RagAnswerWithCitations
                ragAnswer={response.rag.answer}
                ragSourceFiles={response.rag.source_files}
                ragSourceTexts={response.rag.source_texts}
              />
              <Typography variant="body2" sx={{ mt: 2 }}>
                解決できない場合は、もう少し具体的に質問するとより適切に回答できるかもしれません。
              </Typography>
              <FeedbackButtons
                sessionId={response.session_id}
                conversationTime={conversationTime}
                initialFeedback={response.feedback}
                onFeedbackChange={handleFeedbackChange}
              />
            </Box>
          )}

          {/* パターン4: FAQ + RAG両方 */}
          {hasBoth && 'faq' in response && 'rag' in response && (
            <Box>
              {/* RAG回答 */}
              <Box sx={{ mb: 3 }}>
                <RagAnswerWithCitations
                  ragAnswer={response.rag.answer}
                  ragSourceFiles={response.rag.source_files}
                  ragSourceTexts={response.rag.source_texts}
                />
              </Box>

              {/* 関連FAQ */}
              <Box sx={{ mb: 1 }}>
                <RelatedFAQ
                  faqAnswers={response.faq.answer}
                  faqSourceTexts={response.faq.source_texts}
                  faqSourceFiles={response.faq.source_files}
                  title="関連FAQ"
                />
              </Box>
              <Typography variant="body2" sx={{ mt: 2 }}>
                解決できない場合は、もう少し具体的に質問するとより適切に回答できるかもしれません。
              </Typography>
              <FeedbackButtons
                sessionId={response.session_id}
                conversationTime={conversationTime}
                initialFeedback={response.feedback}
                onFeedbackChange={handleFeedbackChange}
              />
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
