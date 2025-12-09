'use client';

import { Alert, Box, Container, Paper, Stack, Typography } from '@mui/material';

import ChatInput from '@/components/chat/ChatInput';
import CitationLabel from '@/components/chat/CitationLabel';
import RelatedFAQ from '@/components/common/RelatedFAQ';
import CustomButton from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Loading from '@/components/ui/Loading';

export default function ComponentsTestPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          コンポーネント一覧
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          実装済みのコンポーネントを確認できます。
        </Alert>
      </Box>

      {/* Components Demo */}
      <Box sx={{ mb: 4 }}>
        {/* Card Examples */}
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Card Component
        </Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box sx={{ flex: 1 }}>
            <Card
              title="Basic Card"
              subtitle="シンプルなカード例"
              actions={
                <CustomButton size="small" variant="contained">
                  Action
                </CustomButton>
              }
            >
              <Typography variant="body2">
                これは基本的なカードコンポーネントの例です。タイトル、サブタイトル、コンテンツ、アクションをサポートしています。
              </Typography>
            </Card>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Card
              title="Interactive Card"
              onMenuClick={() => alert('Menu clicked!')}
            >
              <Typography variant="body2">
                メニューボタン付きのカードです。右上のボタンをクリックしてください。
              </Typography>
            </Card>
          </Box>
        </Stack>

        {/* Button Examples */}
        <Typography variant="h5" gutterBottom>
          Button Component
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 3, flexWrap: 'wrap', gap: 2 }}
        >
          <CustomButton variant="contained">Contained</CustomButton>
          <CustomButton variant="outlined">Outlined</CustomButton>
          <CustomButton variant="text">Text</CustomButton>
          <CustomButton variant="gradient">Gradient</CustomButton>
          <CustomButton variant="contained" loading>
            Loading
          </CustomButton>
          <CustomButton variant="contained" disabled>
            Disabled
          </CustomButton>
        </Stack>

        {/* Loading Examples */}
        <Typography variant="h5" gutterBottom>
          Loading Component
        </Typography>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Paper sx={{ p: 2, textAlign: 'center', flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Circular
            </Typography>
            <Loading variant="circular" message="Loading..." />
          </Paper>
          <Paper sx={{ p: 2, flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Skeleton
            </Typography>
            <Loading variant="skeleton" rows={3} />
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center', flex: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Small Size
            </Typography>
            <Loading variant="circular" size={24} />
          </Paper>
        </Stack>

        {/* Citation Text Example */}
        <Typography variant="h5" gutterBottom>
          Citation Text Component
        </Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" component="div">
            日本の電子部品メーカーである
            <Box
              component="span"
              sx={{
                backgroundColor: 'rgba(110, 65, 255, 0.1)',
                padding: '2px 4px',
                borderRadius: '4px',
              }}
            >
              村田製作所
            </Box>
            は、セラミックコンデンサで世界的なシェアを持ち、
            <Box
              component="span"
              sx={{
                backgroundColor: 'rgba(110, 65, 255, 0.1)',
                padding: '2px 4px',
                borderRadius: '4px',
              }}
            >
              Amazon
            </Box>
            などのグローバル企業と取引しています。
            <CitationLabel
              citations={[
                {
                  id: 'citation-1',
                  title: 'コーポレート | 村田製作所',
                  file_name: 'https://corporate.murata.com/ja-jp/',
                  description:
                    'コーポレートサイトです。企業情報、CSR、株主・投資家情報など、さまざまな情報を掲載しています。',
                },
                {
                  id: 'citation-2',
                  title: 'Amazon',
                  file_name: 'https://www.amazon.co.jp/',
                  description:
                    'Amazon.co.jp 公式サイト。アマゾンで本, 日用品, ファッション, 食品, ベビー用品, カー用品ほか一億種の商品をいつでもお安く。',
                },
              ]}
            />
          </Typography>
        </Paper>

        {/* Related FAQ Example */}
        <Typography variant="h5" gutterBottom>
          Related FAQ Component
        </Typography>
        <Box sx={{ mb: 3 }}>
          <RelatedFAQ />
        </Box>

        {/* Chat Input Example */}
        <Typography variant="h5" gutterBottom>
          Chat Input Component
        </Typography>
        <Box sx={{ mb: 3 }}>
          <ChatInput
            onSend={(text, options) => {
              console.log('Message sent:', { text, options });
              alert(
                `送信されました:\nテキスト: ${text}\n機密情報: ${options.confidential ? 'ON' : 'OFF'}\nファイル数: ${options.files.length}`
              );
            }}
          />
        </Box>
      </Box>
    </Container>
  );
}
