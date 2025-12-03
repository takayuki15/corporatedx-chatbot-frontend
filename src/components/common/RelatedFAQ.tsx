'use client';

import { useState } from 'react';

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Boxで共有リンクを作成すると同じURLになりますか？',
    answer: 'ここに答えを表示',
  },
  {
    id: 'faq-2',
    question: 'OutlookのURLをクリックしても画面が起動しません。',
    answer: 'ここに答えを表示',
  },
  {
    id: 'faq-3',
    question: 'Boxのログイン画面は何ですか？',
    answer: 'ここに答えを表示',
  },
  {
    id: 'faq-4',
    question: 'リモートアクセスのポータルアドレスを教えてください。',
    answer: 'ここに答えを表示',
  },
  {
    id: 'faq-5',
    question: 'OutlookのメールでのURLが自動でハイパーリンクになってしまいます。',
    answer: 'ここに答えを表示',
  },
];

export default function RelatedFAQ() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      sx={{
        p: 3,
        mb: 3,
        backgroundColor: 'background.paper',
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
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          関連FAQ
        </Typography>
        <Tooltip title="この質問に関連するよくある質問を表示しています。">
          <IconButton size="small" sx={{ ml: 1 }}>
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* FAQ Accordion */}
      {faqData.map((faq) => (
        <Accordion
          key={faq.id}
          expanded={expanded === faq.id}
          onChange={handleChange(faq.id)}
          sx={{
            mb: 1,
            '&:before': {
              display: 'none',
            },
            '&.Mui-expanded': {
              margin: '0 0 8px 0',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${faq.id}-content`}
            id={`${faq.id}-header`}
            sx={{
              '& .MuiAccordionSummary-content': {
                margin: '12px 0',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {faq.question}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">
              {faq.answer}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}