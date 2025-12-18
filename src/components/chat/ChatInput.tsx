'use client';

import { Send } from '@mui/icons-material';
import {
  Box,
  IconButton,
  TextField,
  styled,
} from '@mui/material';
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';

interface ChatInputProps {
  onSend: (
    text: string,
    options: { confidential: boolean; files: File[] }
  ) => void;
  disabled?: boolean;
  loading?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const StyledContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  maxWidth: 800,
  margin: '0 auto',
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

export default function ChatInput({
  onSend,
  disabled = false,
  loading = false,
  value,
  onChange,
}: ChatInputProps) {
  const [internalText, setInternalText] = useState('');

  // 外部から制御される場合は value を、そうでなければ内部状態を使用
  const text = value !== undefined ? value : internalText;
  const setText = onChange || setInternalText;
  const [confidential, setConfidential] = useState(true);

  // localStorage から機密情報設定を復元
  useEffect(() => {
    try {
      const saved = localStorage.getItem('confidential');
      if (saved !== null) {
        setConfidential(saved === 'true');
      }
    } catch (error) {
      console.warn(
        'Failed to load confidential setting from localStorage:',
        error
      );
    }
  }, []);

  // 機密情報設定を localStorage に保存
  useEffect(() => {
    try {
      localStorage.setItem('confidential', confidential.toString());
    } catch (error) {
      console.warn(
        'Failed to save confidential setting to localStorage:',
        error
      );
    }
  }, [confidential]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (
        event.key === 'Enter' &&
        !event.shiftKey &&
        !event.nativeEvent.isComposing
      ) {
        event.preventDefault();
        handleSend();
      }
    },
    [text, confidential]
  );

  const handleSend = useCallback(() => {
    const trimmedText = text.trim();
    if (!trimmedText || disabled || loading) return;

    console.log('ChatInput onSend:', {
      text: trimmedText,
      confidential,
      files: [],
    });
    onSend(trimmedText, { confidential, files: [] });

    // 外部制御の場合は onChange で空文字を通知、内部制御の場合は直接設定
    if (onChange) {
      onChange('');
    } else {
      setInternalText('');
    }
  }, [text, confidential, disabled, loading, onSend, onChange]);

  const canSend = text.trim().length > 0 && !disabled && !loading;

  return (
    <Box>
      <StyledContainer>
        {/* 入力エリア */}
        <InputContainer>
          {/* テキスト入力 */}
          <TextField
            fullWidth
            multiline
            maxRows={8}
            placeholder="Shift + Enterで改行、Enterで送信"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            variant="outlined"
            sx={{
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  border: 'none',
                },
              },
            }}
          />

          {/* ボタンエリア */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {/* 送信ボタン */}
            <IconButton
              onClick={handleSend}
              disabled={!canSend}
              aria-label="メッセージを送信"
              size="small"
            >
              <Send />
            </IconButton>
          </Box>
        </InputContainer>
      </StyledContainer>
    </Box>
  );
}
