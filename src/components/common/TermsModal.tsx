'use client';

import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Link,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';

const EXTERNAL_LINKS = {
  生成AIガバナンスルール: '#',
  サービスポータルに記載の内容: '#',
  情報セキュリティ基準: '#',
  '生成AI CoE問合わせ窓口': '#',
  個人情報の取り扱いについて: '#',
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TermsModalProps {}

const TermsModal: React.FC<TermsModalProps> = () => {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState('ja');
  const router = useRouter();

  useEffect(() => {
    const termsConsent = sessionStorage.getItem('termsConsent');
    if (termsConsent !== 'accepted') {
      setOpen(true);
    }
  }, []);

  const handleLanguageChange = (event: unknown) => {
    setLanguage((event as { target: { value: string } }).target.value);
  };

  const handleDisagree = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleAgree = () => {
    sessionStorage.setItem('termsConsent', 'accepted');
    setOpen(false);
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
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            {linkText}
            <OpenInNewIcon fontSize="small" />
          </Link>
        );
      } else if (part.startsWith('{') && part.endsWith('}')) {
        const linkText = part.slice(1, -1);
        const url =
          EXTERNAL_LINKS[linkText as keyof typeof EXTERNAL_LINKS] || '#';
        return (
          <Link key={index} href={url} color="primary">
            {linkText}
          </Link>
        );
      }
      return part;
    });
  };

  const renderTextWithHeaders = (text: string) => {
    const parts = text.split(
      /(\[.*?\]|\{.*?\}|^利用にあたって$|^入力・出力に関する注意事項$)/gm
    );

    return parts.map((part, index) => {
      if (part === '利用にあたって') {
        return (
          <Typography
            key={index}
            sx={{
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#333',
              mt: 2,
              mb: 1,
            }}
          >
            {part}
          </Typography>
        );
      } else if (part === '入力・出力に関する注意事項') {
        return (
          <Typography
            key={index}
            sx={{
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#333',
              mt: 3,
              mb: 1,
            }}
          >
            {part}
          </Typography>
        );
      } else if (part.startsWith('[') && part.endsWith(']')) {
        const linkText = part.slice(1, -1);
        const url =
          EXTERNAL_LINKS[linkText as keyof typeof EXTERNAL_LINKS] || '#';
        return (
          <Link
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            {linkText}
            <OpenInNewIcon fontSize="small" />
          </Link>
        );
      } else if (part.startsWith('{') && part.endsWith('}')) {
        const linkText = part.slice(1, -1);
        const url =
          EXTERNAL_LINKS[linkText as keyof typeof EXTERNAL_LINKS] || '#';
        return (
          <Link key={index} href={url} color="primary">
            {linkText}
          </Link>
        );
      }
      return part;
    });
  };

  const termsContent = `利用にあたって
・ムラタヘルプ（以下、本サービス）はムラタ社員向けサービスです。
・本サービスはムラタのエンタープライスID（MIAM ID）を持っている方（一部拠点を除く）が利用可能です。
・本サービスの利用前には、[生成AIガバナンスルール]や[サービスポータルに記載の内容]をよく確認してください。
・本サービスの利用にあたっては、会社の就業規則および[情報セキュリティ基準]等を厳守遵守してください。
・不明点や質問などありましたら、[生成AI CoE問合わせ窓口]にお問い合わせ下さい。

入力・出力に関する注意事項
・企業機密を入力する際には、企業機密入力UIを使用してください。
・「個人情報※1」、「他社の著作物及び権利物」は入力しないでください。
　※1 個人情報の目的外利用とならない「用途：議事録及びメールの作成、、会議の文字起こし及び要約」および「情報：氏名、役職、所属、電話番号、メールアドレス」の双方の条件を満たす場合については、入力できます。
・出力を利用する前に必ずムラタ社員にて、「企業機密の含有」、「正確かつ適切であること」、「権利侵害・法令違反がないこと」を確認してください。
・「プログラムコード以外のテキスト」の出力のうち、上記ムラタ社員による確認・修正があれば社外開示・社外持出できます。
・「プログラムコード」の出力についても上記満たしていれば、社外開示できます。ただし、社外持出はSSDRで問題ないことを確認してください。`;

  const privacyContent = `Femtet Navigator（以下、本サービス）では、メール等を通じてユーザーニーズに沿ったご提案・ご案内・サポートをするため、またサービス・イベントの改善や向上のため、ユーザの利用履歴情報（プロンプト入力・出力ログやタイトル等）と個人情報等（社内メールアドレス、所属、氏名、OSやブラウザ情報等）を組み合わせ・加工・分析し、社内開発関係者内において利用します。詳しくは、個人情報の取り扱いについてをご参照ください。なお、{個人情報の取り扱いについて}同意いただけない場合は本サービスはご利用いただけません。`;

  if (!open) return null;

  return (
    <Dialog
      open={open}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      sx={{
        '& .MuiBackdrop-root': {
          pointerEvents: 'none',
        },
        '& .MuiDialog-paper': {
          borderRadius: 2,
          border: '2px solid',
          borderColor: '#ccc',
          backgroundColor: '#f8f9fa',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid #ddd',
          fontSize: '18px',
          fontWeight: 'bold',
          textAlign: 'center',
          py: 2,
        }}
      >
        利用規約
      </DialogTitle>

      <DialogContent
        sx={{
          maxHeight: '50vh',
          overflow: 'auto',
          px: 4,
          py: 3,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: 1,
          mx: 2,
          my: 1,
        }}
      >
        <Typography
          component="div"
          sx={{
            whiteSpace: 'pre-line',
            lineHeight: 1.6,
            mb: 3,
            fontSize: '14px',
            color: '#333',
          }}
        >
          {renderTextWithHeaders(termsContent)}
        </Typography>

        <Box
          sx={{
            border: '2px solid #333',
            borderRadius: 1,
            p: 2,
            backgroundColor: '#f5f5f5',
            mt: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 1,
              fontWeight: 'bold',
              fontSize: '16px',
              color: '#333',
              textAlign: 'center',
            }}
          >
            個人情報の取り扱い
          </Typography>
          <Typography
            component="div"
            sx={{
              whiteSpace: 'pre-line',
              lineHeight: 1.6,
              fontSize: '14px',
              color: '#333',
            }}
          >
            {renderTextWithLinks(privacyContent)}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          backgroundColor: '#f8f9fa',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', color: '#666' }}>
            言語設定
          </Typography>
          <FormControl size="small">
            <Select
              value={language}
              onChange={handleLanguageChange}
              sx={{
                fontSize: '14px',
                minWidth: 100,
                height: 32,
              }}
            >
              <MenuItem value="ja">日本語</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={handleDisagree}
            variant="outlined"
            sx={{
              borderColor: '#666',
              color: '#666',
              fontSize: '14px',
              px: 3,
              py: 1,
              '&:hover': {
                borderColor: '#333',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            同意しない
          </Button>
          <Button
            onClick={handleAgree}
            variant="contained"
            color="primary"
            sx={{
              fontSize: '14px',
              px: 3,
              py: 1,
            }}
          >
            同意して利用開始
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default TermsModal;
