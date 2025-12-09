'use client';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import { useState } from 'react';

const EXTERNAL_LINKS = {
  生成AIガバナンスルール: '#',
  サービスポータルに記載の内容: '#',
  情報セキュリティ基準: '#',
  '生成AI CoE 問合せ窓口': '#',
  個人情報の取り扱いについて: '#',
};

interface TermsMessageProps {
  onAgreeChange: (agreed: boolean) => void;
}

export default function TermsMessage({ onAgreeChange }: TermsMessageProps) {
  const [agreed, setAgreed] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setAgreed(isChecked);
    onAgreeChange(isChecked);
  };

  const renderTextWithLinks = (text: string) => {
    const parts = text.split(/(\[.*?\]|\{.*?\})/);

    return parts.map((part, index) => {
      if (part.startsWith('[') && part.endsWith(']')) {
        const linkText = part.slice(1, -1);
        const url =
          EXTERNAL_LINKS[linkText as keyof typeof EXTERNAL_LINKS] || '#';
        return (
          <Link
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              color: '#333',
              textDecorationColor: '#333',
            }}
          >
            {linkText}
            <OpenInNewIcon sx={{ fontSize: '14px' }} />
          </Link>
        );
      } else if (part.startsWith('{') && part.endsWith('}')) {
        const linkText = part.slice(1, -1);
        const url =
          EXTERNAL_LINKS[linkText as keyof typeof EXTERNAL_LINKS] || '#';
        return (
          <Link
            key={index}
            href={url}
            sx={{ color: '#333', textDecorationColor: '#333' }}
          >
            {linkText}
          </Link>
        );
      }
      return part;
    });
  };

  const sections = [
    {
      title: '利用にあたって',
      paragraphs: [
        'Murata Coworker（以下、本サービス）はムラタ社員向けのAIチャットサービスです。',
        '本サービスはムラタのエンタープライズID（MIAM ID）を持っている方（一部拠点を除く）が利用可能です。',
        '本サービスの利用前には、[生成AIガバナンスルール]や[サービスポータルに記載の内容]をよく確認してください。',
        '本サービスの利用にあたっては、会社の就業規則および[情報セキュリティ基準]等を遵守してください。',
        '不明点や質問などありましたら、[生成AI CoE 問合せ窓口]にお問い合わせください。',
      ],
    },
    {
      title: '入力・出力に関する注意事項',
      paragraphs: [
        '個人情報（※1）と他社の著作物および権利物は入力禁止です。\n※1 個人情報の目的外利用でない「用途：議事録及びメールの作成、会議の文字起こし及び要約」および「情報：氏名、役職、所属、電話番号、メールアドレス」の双方の条件を満たす場合は、入力できます。',
        '出力の社外開示・社外持出をする際には、企業機密の含有・正確かつ適切であること・権利侵害・法令違反がないことをムラタ社員による確認・修正が必要です。',
        '出力が「プログラムコード」の場合、社外持出はSSDRで問題ないことを確認してください。',
      ],
    },
    {
      title: '個人情報の取り扱い',
      paragraphs: [
        '本サービスでは、メール等を通じてニーズに沿った対応とサービスの改善のため、利用履歴情報（プロンプト入力・出力ログやタイトル等）と個人情報等（社内メールアドレス、所属、氏名、OSやブラウザ情報等）を社内開発関係者内において利用します。',
        '詳しくは、[個人情報の取り扱いについて]をご参照ください。',
      ],
    },
  ];

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 3 }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: '80%',
          p: 3,
          bgcolor: 'grey.100',
          borderRadius: 2,
        }}
      >
        {sections.map((section, sIndex) => (
          <Box key={sIndex}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '13px',
                fontWeight: 'bold',
                mb: 1,
                mt: sIndex > 0 ? 3 : 0,
              }}
            >
              {section.title}
            </Typography>
            <Box
              component="ul"
              sx={{
                listStyleType: 'disc',
                pl: 3,
                m: 0,
              }}
            >
              {section.paragraphs.map((paragraph, pIndex) => (
                <Box
                  component="li"
                  key={pIndex}
                  sx={{
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: '#333',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {renderTextWithLinks(paragraph)}
                </Box>
              ))}
            </Box>
          </Box>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={agreed}
                onChange={handleChange}
                size="small"
                sx={{
                  color: '#6E41FF',
                  '&.Mui-checked': {
                    color: '#6E41FF',
                  },
                }}
              />
            }
            label={
              <Typography sx={{ fontSize: '13px' }}>
                上記の内容に同意する
              </Typography>
            }
          />
        </Box>
      </Paper>
    </Box>
  );
}
