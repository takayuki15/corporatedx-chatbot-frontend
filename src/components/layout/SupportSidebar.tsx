'use client';

import {
  ArrowBack as ArrowBackIcon,
  CheckCircleOutline as CheckCircleIcon,
  ChevronLeft as ChevronLeftIcon,
  Close as CloseIcon,
  InfoOutlined as InfoIcon,
  SendOutlined as SendIcon,
  WarningAmberOutlined as WarningIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Drawer,
  IconButton,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useState } from 'react';

interface SupportContact {
  id: string;
  name: string;
  description: string;
}

interface SupportSidebarProps {
  open: boolean;
  onClose: () => void;
}

interface InquiryFormData {
  message: string;
}

const steps = ['入力', '確認', '完了'];

// 問い合わせ先のモックデータ
const supportContacts: SupportContact[] = [
  {
    id: '1',
    name: '総務チーム',
    description:
      '社内の施設管理、備品管理、オフィス環境に関するお問い合わせを承ります。',
  },
  {
    id: '2',
    name: '人事チーム',
    description:
      '勤怠管理、給与、福利厚生、人事評価、採用に関するご質問にお答えします。人事制度や社内規程についてもご相談いただけます。',
  },
  {
    id: '3',
    name: '経理チーム',
    description:
      '経費精算、請求書処理、予算管理、会計処理に関するサポートを提供します。',
  },
  {
    id: '4',
    name: 'ITサポートチーム',
    description:
      'PC、ネットワーク、社内システム、ソフトウェアライセンスなど、IT関連全般のトラブルシューティングとサポートを行います。アカウント管理やセキュリティに関する問い合わせもお受けします。',
  },
  {
    id: '5',
    name: '法務チーム',
    description:
      '契約書のレビュー、法的相談、コンプライアンス関連のご質問に対応します。',
  },
];

/**
 * 有人窓口サイドバーコンポーネント
 */
export default function SupportSidebar({ open, onClose }: SupportSidebarProps) {
  const [selectedContact, setSelectedContact] = useState<SupportContact | null>(
    null
  );
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<InquiryFormData>({
    message: '',
  });

  // サイドバーを閉じる時にリセット
  const handleClose = () => {
    setSelectedContact(null);
    setActiveStep(0);
    setFormData({
      message: '',
    });
    onClose();
  };

  // チームカードをクリック
  const handleContactClick = (contact: SupportContact) => {
    setSelectedContact(contact);
    setActiveStep(0);
  };

  // 一覧に戻る
  const handleBackToList = () => {
    setSelectedContact(null);
    setActiveStep(0);
  };

  // 次のステップへ
  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  // 前のステップへ
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  // フォームデータ更新
  const handleFormChange = (field: keyof InquiryFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 送信処理
  const handleSubmit = () => {
    // TODO: 実際の送信処理を実装
    console.log('問い合わせ送信:', formData, selectedContact);
    handleNext();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* ヘッダー */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {selectedContact
                  ? `${selectedContact.name}への問い合わせ`
                  : 'このチャットに関する有人窓口'}
              </Typography>
              {!selectedContact && (
                <Tooltip
                  title="チャット内容に関連する問い合わせ先を表示しています。担当チームに直接お問い合わせいただけます。"
                  placement="bottom"
                  arrow
                >
                  <InfoIcon
                    sx={{
                      fontSize: 18,
                      color: 'text.secondary',
                      cursor: 'pointer',
                      '&:hover': {
                        color: 'primary.main',
                      },
                    }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
            aria-label="閉じる"
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* コンテンツエリア */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {!selectedContact ? (
            // 問い合わせ先一覧
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {supportContacts.map(contact => (
                <Card
                  key={contact.id}
                  onClick={() => handleContactClick(contact)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'rgba(110, 65, 255, 0.05)',
                      borderColor: '#6E41FF',
                    },
                  }}
                  variant="outlined"
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, mb: 1 }}
                    >
                      {contact.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {contact.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            // 問い合わせフォーム
            <Box>
              {/* ステッパー */}
              <Stepper
                activeStep={activeStep}
                sx={{
                  mb: 3,
                  '& .MuiStepIcon-root.Mui-active': {
                    color: '#6E41FF',
                  },
                  '& .MuiStepIcon-root.Mui-completed': {
                    color: '#6E41FF',
                  },
                  '& .MuiStepIcon-text': {
                    fontWeight: 600,
                  },
                }}
              >
                {steps.map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* ステップ内容 */}
              {activeStep === 0 && (
                // 入力ステップ
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    お問い合わせ窓口の担当者が入力できるテキスト150文字程度：ご質問やご相談がございましたら、下記フォームよりお問い合わせください。内容を確認のうえ、担当者より順次ご連絡いたします。土日祝日を除き、通常1〜3営業日以内に対応いたします。
                  </Typography>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      お問い合わせ内容
                    </Typography>
                    <TextField
                      required
                      fullWidth
                      multiline
                      rows={10}
                      value={formData.message}
                      onChange={e =>
                        handleFormChange('message', e.target.value)
                      }
                    />
                  </Box>
                </Box>
              )}

              {activeStep === 1 && (
                // 確認ステップ
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    sx={{
                      bgcolor: '#fff3e0',
                      borderRadius: 1,
                      p: 2,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <WarningIcon sx={{ color: '#ed6c02', fontSize: 20 }} />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: '#ed6c02' }}
                      >
                        お問い合わせ前にご確認ください
                      </Typography>
                    </Box>
                    <Box
                      component="ul"
                      sx={{ m: 0, pl: 2.5, listStyleType: 'disc' }}
                    >
                      <Typography
                        component="li"
                        variant="body2"
                        sx={{ mb: 0.5, color: '#ed6c02', display: 'list-item' }}
                      >
                        有人窓口の担当者には、このチャット画面内の内容が共有されます。
                      </Typography>
                      <Typography
                        component="li"
                        variant="body2"
                        sx={{ color: '#ed6c02', display: 'list-item' }}
                      >
                        お問い合わせ以降は、このチャットへの入力ができなくなります。
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                      お問い合わせ内容
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {formData.message}
                    </Typography>
                  </Box>
                </Box>
              )}

              {activeStep === 2 && (
                // 完了ステップ
                <Box
                  sx={{
                    bgcolor: '#e8f5e9',
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: '#2e7d32' }}
                    >
                      お問い合わせが完了しました
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#2e7d32' }}>
                    担当者からメール等でご連絡いたします。
                    <br />
                    ◯日以上連絡がない場合、再度お問い合わせください。
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>

        {/* フッター（フォーム表示時のみ） */}
        {selectedContact && (
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            {activeStep === 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button startIcon={<ChevronLeftIcon />} onClick={handleBackToList}>
                  戻る
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!formData.message}
                  sx={{
                    bgcolor: '#6E41FF',
                    '&:hover': {
                      bgcolor: '#5C35CC',
                    },
                  }}
                >
                  確認画面へ
                </Button>
              </Box>
            )}
            {activeStep === 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button startIcon={<ChevronLeftIcon />} onClick={handleBack}>
                  戻る
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleSubmit}
                  sx={{
                    bgcolor: '#6E41FF',
                    '&:hover': {
                      bgcolor: '#5C35CC',
                    },
                  }}
                >
                  送信
                </Button>
              </Box>
            )}
            {activeStep === 2 && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handleBackToList}
                  sx={{
                    color: '#6E41FF',
                    borderColor: '#6E41FF',
                    '&:hover': {
                      borderColor: '#5C35CC',
                      bgcolor: 'rgba(110, 65, 255, 0.05)',
                    },
                  }}
                >
                  一覧に戻る
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
