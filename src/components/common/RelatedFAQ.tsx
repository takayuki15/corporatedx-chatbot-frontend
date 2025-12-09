'use client';

import { useState } from 'react';

import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
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
   * 形式: "Q: 質問文\nA: 回答文"
   */
  const parseFAQItem = (sourceText: string): FAQItem => {
    const lines = sourceText.split('\n');
    let question = '';
    let answer = '';

    for (const line of lines) {
      if (line.startsWith('Q: ')) {
        question = line.substring(3).trim();
      } else if (line.startsWith('A: ')) {
        answer = line.substring(3).trim();
      }
    }

    return { question, answer };
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
              {item.answer}
            </Typography>
            {faqSourceFiles && faqSourceFiles[index] && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                出典: {faqSourceFiles[index]}
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
