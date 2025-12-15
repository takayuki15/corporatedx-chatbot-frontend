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
  CircularProgress,
  Alert,
} from '@mui/material';
import { useState, useEffect } from 'react';
import type {
  ChatMessage,
  SendMailRequest,
  SendMailResponse,
  MannedCounterDetail,
  GetMannedCounterRequest,
  GetMannedCounterResponse,
} from '@/lib/api';
import { useUserContext } from '@/contexts';

interface SupportSidebarProps {
  open: boolean;
  onClose: () => void;
  priorityMannedCounterNames: string[];
  chatHistory: ChatMessage[];
  businessSubCategories: string[];
}

interface InquiryFormData {
  message: string;
}

const steps = ['入力', '確認', '完了'];

/**
 * 有人窓口サイドバーコンポーネント
 */
export default function SupportSidebar({
  open,
  onClose,
  priorityMannedCounterNames,
  chatHistory,
  businessSubCategories,
}: SupportSidebarProps) {
  const { user, employeeInfo } = useUserContext();
  const [mannedCounterInfo, setMannedCounterInfo] = useState<MannedCounterDetail[]>([]);
  const [isLoadingCounters, setIsLoadingCounters] = useState(false);
  const [selectedContact, setSelectedContact] =
    useState<MannedCounterDetail | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<InquiryFormData>({
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentText, setSentText] = useState<string>('');

  // 有人窓口情報を取得
  useEffect(() => {
    const fetchMannedCounters = async () => {
      if (!open || !employeeInfo) {
        return;
      }

      setIsLoadingCounters(true);
      setError(null);

      try {
        const requestBody: GetMannedCounterRequest = {
          priority_manned_counter_names: priorityMannedCounterNames,
          company: employeeInfo.company_code,
          office: employeeInfo.office_code,
        };

        const response = await fetch('/chatbot/api/get_manned_counter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error('有人窓口情報の取得に失敗しました');
        }

        const data = (await response.json()) as GetMannedCounterResponse;
        setMannedCounterInfo(data.manned_counter_info);
      } catch (err) {
        console.error('Error fetching manned counters:', err);
        setError(
          err instanceof Error ? err.message : '有人窓口情報の取得に失敗しました'
        );
      } finally {
        setIsLoadingCounters(false);
      }
    };

    fetchMannedCounters();
  }, [open, priorityMannedCounterNames, employeeInfo]);

  // サイドバーを閉じる時にリセット
  const handleClose = () => {
    setSelectedContact(null);
    setActiveStep(0);
    setFormData({
      message: '',
    });
    setIsSubmitting(false);
    setError(null);
    setSentText('');
    onClose();
  };

  // チームカードをクリック
  const handleContactClick = (contact: MannedCounterDetail) => {
    setSelectedContact(contact);
    setActiveStep(0);
    setError(null);
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
  const handleSubmit = async () => {
    if (!selectedContact || !user || !employeeInfo) {
      setError('必要な情報が不足しています');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // チャット履歴をメール本文に整形
      const chatHistoryText = chatHistory
        .map(msg => `[${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}]\n${msg.content}`)
        .join('\n\n');

      const mailContent = `【お問い合わせ内容】\n${formData.message}\n\n【チャット履歴】\n${chatHistoryText}`;

      // SendMailRequestを構築
      const requestBody: SendMailRequest = {
        questioner_email: user.unique_name,
        manned_counter_name: selectedContact.manned_counter_name || '',
        company: employeeInfo.company_code,
        office: employeeInfo.office_code,
        mail_content: mailContent,
        manned_counter_email: selectedContact.manned_counter_email || '',
        is_office_access_only: false, // デフォルト値
      };

      const response = await fetch('/chatbot/api/send-mail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('メール送信に失敗しました');
      }

      const result = (await response.json()) as SendMailResponse;
      setSentText(result.sent_text);
      handleNext();
    } catch (err) {
      console.error('Error sending mail:', err);
      setError(
        err instanceof Error ? err.message : 'メール送信中にエラーが発生しました'
      );
    } finally {
      setIsSubmitting(false);
    }
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
                  ? `${selectedContact.manned_counter_name || selectedContact.business_sub_category}への問い合わせ`
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
              {isLoadingCounters ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : mannedCounterInfo.length === 0 ? (
                <Alert severity="info">
                  利用可能な有人窓口がありません。
                </Alert>
              ) : (
                mannedCounterInfo.map((contact, index) => (
                  <Card
                    key={`${contact.manned_counter_name}-${index}`}
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
                        {contact.manned_counter_name}
                      </Typography>
                      {contact.manned_counter_description && (
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
                          {contact.manned_counter_description}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          ) : (
            // 問い合わせフォーム
            <Box>
              {/* エラー表示 */}
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

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
                  <Typography
                    variant="body2"
                    sx={{ color: '#2e7d32', whiteSpace: 'pre-line' }}
                  >
                    {sentText ||
                      '担当者からメール等でご連絡いたします。\n◯日以上連絡がない場合、再度お問い合わせください。'}
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
                <Button
                  startIcon={<ChevronLeftIcon />}
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  戻る
                </Button>
                <Button
                  variant="contained"
                  startIcon={
                    isSubmitting ? <CircularProgress size={20} /> : <SendIcon />
                  }
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  sx={{
                    bgcolor: '#6E41FF',
                    '&:hover': {
                      bgcolor: '#5C35CC',
                    },
                  }}
                >
                  {isSubmitting ? '送信中...' : '送信'}
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
