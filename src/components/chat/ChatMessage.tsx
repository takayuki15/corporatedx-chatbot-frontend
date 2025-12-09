'use client';

import RelatedFAQ from '@/components/common/RelatedFAQ';
import type { RagResponse } from '@/lib/api';
import { ThumbDownOutlined, ThumbUpOutlined } from '@mui/icons-material';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import type { Citation } from './CitationPopover';
import CitationText from './CitationText';

interface ChatMessageProps {
  response: RagResponse;
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
function FeedbackButtons() {
  const handleGoodClick = () => {
    // TODO: フィードバックAPIを実装後、Good評価を送信
    console.log('Good feedback clicked');
  };

  const handleBadClick = () => {
    // TODO: フィードバックAPIを実装後、Bad評価を送信
    console.log('Bad feedback clicked');
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
      <IconButton
        size="small"
        onClick={handleGoodClick}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'success.main',
            bgcolor: 'success.lighter',
          },
        }}
        aria-label="Good feedback"
      >
        <ThumbUpOutlined fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={handleBadClick}
        sx={{
          color: 'text.secondary',
          '&:hover': {
            color: 'error.main',
            bgcolor: 'error.lighter',
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
 * チャットメッセージ表示コンポーネント
 * RAGレスポンスの各パターンに対応した表示を行う
 */
export default function ChatMessage({ response }: ChatMessageProps) {
  // 最後のユーザーメッセージを取得
  const lastUserMessage = response.chat_history
    .filter(msg => msg.role === 'user')
    .pop();

  // 投稿時間を現在時刻で表示（TODO: メッセージごとのタイムスタンプを追加）
  const timestamp = new Date().toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

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
      {lastUserMessage && (
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
            <Typography variant="body1">{lastUserMessage.content}</Typography>
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
            <RelatedFAQ
              faqAnswers={response.faq.answer}
              faqSourceTexts={response.faq.source_texts}
              faqSourceFiles={response.faq.source_files}
              title="関連FAQ"
            />
          )}

          {/* パターン3: RAG回答のみ */}
          {hasRagOnly && 'rag' in response && (
            <Box>
              <RagAnswerWithCitations
                ragAnswer={response.rag.answer}
                ragSourceFiles={response.rag.source_files}
                ragSourceTexts={response.rag.source_texts}
              />
              <FeedbackButtons />
            </Box>
          )}

          {/* パターン4: FAQ + RAG両方 */}
          {hasBoth && 'faq' in response && 'rag' in response && (
            <Box>
              {/* 関連FAQ */}
              <Box sx={{ mb: 3 }}>
                <RelatedFAQ
                  faqAnswers={response.faq.answer}
                  faqSourceTexts={response.faq.source_texts}
                  faqSourceFiles={response.faq.source_files}
                  title="関連FAQ"
                />
              </Box>

              {/* RAG回答 */}
              <Box>
                <RagAnswerWithCitations
                  ragAnswer={response.rag.answer}
                  ragSourceFiles={response.rag.source_files}
                  ragSourceTexts={response.rag.source_texts}
                />
                <FeedbackButtons />
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
