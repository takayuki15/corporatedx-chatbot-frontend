'use client';

import { useState } from 'react';

import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Typography,
} from '@mui/material';

interface FAQItem {
  question: string;
  answer: string;
}

interface RelatedFAQProps {
  faqAnswers?: string[];
  faqSourceTexts?: string[];
  faqSourceFiles?: string[];
  title?: string;
  tooltipText?: string;
}

export default function RelatedFAQ({
  faqAnswers,
  faqSourceTexts,
  faqSourceFiles,
  title = '関連FAQ',
}: RelatedFAQProps) {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange =
    (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  /**
   * FAQ source textから質問と回答をパース
   * 形式: "質問: [カテゴリ] 質問内容 回答: 回答内容"
   */
  const parseFAQItem = (sourceText: string): FAQItem => {
    // "回答:" で分割して質問と回答を取得
    const parts = sourceText.split(/\s*回答:\s*/);

    let question = '';
    let answer = '';

    if (parts.length >= 2) {
      // "質問:" を除去して質問部分を取得
      question = parts[0].replace(/^質問:\s*/, '').trim();
      // 回答部分を取得（2番目以降を結合、"回答:"が複数ある場合に対応）
      answer = parts.slice(1).join(' 回答: ').trim();
    }

    return { question, answer };
  };

  /**
   * 回答テキスト内のurltextと直接URLをパースしてReact要素に変換
   * 形式1: {{ urltext("テキスト", "URL") }}
   * 形式2: http://... または https://... (直接URL) → 「リンク」と表示
   */
  const parseAnswerWithLinks = (answer: string): React.ReactNode[] => {
    const urltextPattern =
      /\{\{\s*urltext\s*\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\)\s*\}\}/g;
    const urlPattern = /(https?:\/\/[^\s]+)/g;

    // 全てのパターンをマッチして位置順にソート
    const matches: Array<{
      index: number;
      length: number;
      type: 'urltext' | 'url';
      text?: string;
      url: string;
    }> = [];

    // urltextパターンのマッチ
    let urltextMatch: RegExpExecArray | null;
    while ((urltextMatch = urltextPattern.exec(answer)) !== null) {
      matches.push({
        index: urltextMatch.index,
        length: urltextMatch[0].length,
        type: 'urltext',
        text: urltextMatch[1],
        url: urltextMatch[2],
      });
    }

    // 直接URLパターンのマッチ（urltextの中のURLは除外）
    let urlMatch: RegExpExecArray | null;
    while ((urlMatch = urlPattern.exec(answer)) !== null) {
      // このURLがurltextの中に含まれているかチェック
      const isInsideUrltext = matches.some(
        m =>
          m.type === 'urltext' &&
          urlMatch!.index >= m.index &&
          urlMatch!.index < m.index + m.length
      );

      if (!isInsideUrltext) {
        matches.push({
          index: urlMatch.index,
          length: urlMatch[0].length,
          type: 'url',
          url: urlMatch[1],
        });
      }
    }

    // 位置順にソート
    matches.sort((a, b) => a.index - b.index);

    // マッチがない場合は元のテキストをそのまま返す
    if (matches.length === 0) {
      return [answer];
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, idx) => {
      // マッチの前のテキストを追加
      if (match.index > lastIndex) {
        const textBefore = answer.substring(lastIndex, match.index);
        if (textBefore) {
          parts.push(textBefore);
        }
      }

      // リンクを追加
      const linkText = match.type === 'urltext' ? match.text! : 'リンク';
      parts.push(
        <Link
          key={`link-${match.index}-${idx}`}
          href={match.url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'primary.main' }}
        >
          {linkText}
        </Link>
      );

      lastIndex = match.index + match.length;
    });

    // 残りのテキストを追加
    if (lastIndex < answer.length) {
      const remainingText = answer.substring(lastIndex);
      if (remainingText) {
        parts.push(remainingText);
      }
    }

    return parts;
  };

  // faq_source_textsがある場合はそれを使用、なければfaq_answersを使用
  const faqItems: FAQItem[] = faqSourceTexts
    ? faqSourceTexts.map(parseFAQItem)
    : (faqAnswers || []).map((answer, index) => ({
        question: `FAQ ${index + 1}`,
        answer,
      }));

  if (faqItems.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* FAQ Accordion */}
      {faqItems.map((item, index) => (
        <Accordion
          key={`faq-${index}`}
          expanded={expanded === `faq-${index}`}
          onChange={handleChange(`faq-${index}`)}
          sx={{
            mb: 0.5,
            bgcolor: 'background.paper',
            '&:before': {
              display: 'none',
            },
            '&.Mui-expanded': {
              margin: '0 0 4px 0',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`faq-${index}-content`}
            id={`faq-${index}-header`}
            sx={{
              bgcolor: 'background.paper',
              '& .MuiAccordionSummary-content': {
                margin: '12px 0',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {item.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              bgcolor: 'background.paper',
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ whiteSpace: 'pre-wrap' }}
            >
              {parseAnswerWithLinks(item.answer)}
            </Typography>
            {faqSourceFiles && faqSourceFiles[index] && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: 'block' }}
              >
                出典: {faqSourceFiles[index]}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
