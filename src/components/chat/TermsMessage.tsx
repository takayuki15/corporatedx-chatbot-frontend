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
  生成AIガバナンスルール:
    'https://murataglobal.sharepoint.com/sites/MMC_generativeAI/SitePages/%E7%94%9F%E6%88%90AI%E3%81%AB%E9%96%A2%E3%81%99%E3%82%8B%E3%82%AC%E3%83%90%E3%83%8A%E3%83%B3%E3%82%B9.aspx',
  サービスポータルに記載の内容:
    'https://murataglobal.sharepoint.com/sites/MMC_generativeAI/MurataCoworker/SitePages/%E5%88%A9%E7%94%A8%E8%A6%8F%E7%B4%84%E3%83%BB%E5%88%A9%E7%94%A8%E6%96%B9%E6%B3%95%E3%83%BB%E6%A9%9F%E5%AF%86%E6%83%85%E5%A0%B1%E5%85%A5%E5%8A%9B.aspx',
  情報セキュリティ基準:
    'https://murataglobal.sharepoint.com/sites/MMC_InformationSecurity_PersonalInformation',
  '10_質疑 | シンムラタヘルプ運営用 | Microsoft Teams':
    'https://teams.microsoft.com/l/channel/19%3Ad891da52ccd64f098a75ad74edf9f32c%40thread.tacv2/10_%E8%B3%AA%E7%96%91?groupId=a3fe8fa1-333b-4f17-b0fd-93741bab2a42&tenantId=afff1096-7fd8-4cdd-879a-7db50a47287a',
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
        'MurataHelp（以下、本サービス）はムラタ社員向けのヘルプチャットボットサービスです。',
        '本サービスはムラタのエンタープライズID（MIAM ID）を持っている方（一部拠点を除く）が利用可能です。',
        '本サービスの利用前には、[生成AIガバナンスルール]や[サービスポータルに記載の内容]をよく確認してください。',
        '本サービスの利用にあたっては、会社の就業規則および[情報セキュリティ基準]等を遵守してください。',
        '不明点や質問などありましたら、[10_質疑 | シンムラタヘルプ運営用 | Microsoft Teams]でシステム導入担当にお問い合わせください。',
      ],
    },
    {
      title: '入力・出力に関する注意事項',
      paragraphs: [
        '「個人情報※1」、「他社の著作物及び権利物」は入力しないでください。\n※1　個人情報の目的外利用とならない「用途：議事録及びメールの作成、会議の文字起こし及び要約」および「情報：氏名、役職、所属、電話番号、メールアドレス」の双方の条件を満たす場合については、入力できます。',
        '出力を利用する前に必ずムラタ社員にて、「企業機密の含有」、「正確かつ適切であること」、「権利侵害・法令違反がないこと」を確認してください。',
      ],
    },
    {
      title: '個人情報の取り扱い',
      paragraphs: [
        '本サービスでは、メール等を通じてユーザーニーズに沿ったご提案・ご案内・サポートをするため、またサービス・イベントの改善や向上のため、ユーザの利用履歴情報（プロンプト入力・出力ログやタイトル等）と個人情報等（社内メールアドレス、所属、氏名、ＯＳやブラウザ情報等） を組み合わせ・加工・分析し、社内開発関係者内において利用します。詳しくは、[個人情報の取り扱いについて]をご参照ください。 なお、個人情報の取扱いについて同意いただけない場合は本サービスはご利用頂けません。',
        '上記をご確認いただき、本サービスの機能改善・向上等にご協力いただける場合は、ご同意をお願い致します。',
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
