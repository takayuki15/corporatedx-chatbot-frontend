'use client';

import {
  Alert,
  Box,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import CustomButton from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import type { Employee, ErrorResponse } from '@/lib/api';

export default function ApiTestPage() {
  const [miamid, setMiamid] = useState('user@example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Employee | ErrorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchEmployee = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch(
        `/chatbot/api/employee?MIAMID=${encodeURIComponent(miamid)}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(
          `Error ${response.status}: ${data.message || data.error || 'Unknown error'}`
        );
        setResult(data);
      } else {
        setResult(data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setResult({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          API テスト
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          APIの動作を確認できます。
        </Alert>
      </Box>

      {/* Employee API Test */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Employee API Test
        </Typography>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="MIAMID"
              value={miamid}
              onChange={e => setMiamid(e.target.value)}
              placeholder="user@example.com"
              fullWidth
              helperText="従業員のMIAMID（メールアドレス）を入力してください"
            />
            <CustomButton
              variant="contained"
              onClick={handleFetchEmployee}
              disabled={loading || !miamid.trim()}
              loading={loading}
            >
              API実行
            </CustomButton>

            {loading && (
              <Box sx={{ py: 2 }}>
                <Loading variant="circular" message="従業員情報を取得中..." />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            {result && !loading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  レスポンス結果:
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    mt: 1,
                    bgcolor: 'grey.50',
                    maxHeight: 400,
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {JSON.stringify(result, null, 2)}
                  </Typography>
                </Paper>
              </Box>
            )}
          </Stack>
        </Paper>
      </Box>
    </Container>
  );
}
