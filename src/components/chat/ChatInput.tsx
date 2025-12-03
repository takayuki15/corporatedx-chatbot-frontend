'use client';

import {
  AttachFile,
  Image,
  InfoOutlined,
  Send,
  WarningAmberOutlined,
  BlockOutlined,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
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

const AlertBar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isConfidential',
})<{ isConfidential: boolean }>(({ theme, isConfidential }) => ({
  margin: 0,
  borderRadius: 0,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: theme.spacing(1, 2),
  ...(isConfidential && {
    backgroundColor: '#fff3cd',
    color: '#856404',
  }),
  ...(!isConfidential && {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
  }),
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const ALLOWED_FILE_TYPES = [
  '.pdf',
  '.docx',
  '.xlsx',
  '.pptx',
  '.txt',
  '.png',
  '.jpg',
  '.jpeg',
];
const MAX_FILES = 5;
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

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
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  const validateFiles = useCallback(
    (newFiles: File[]): string | null => {
      const allFiles = [...files, ...newFiles];

      if (allFiles.length > MAX_FILES) {
        return `ファイル数は${MAX_FILES}個以下にしてください。`;
      }

      const totalSize = allFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > MAX_TOTAL_SIZE) {
        return `合計ファイルサイズは20MB以下にしてください。`;
      }

      for (const file of newFiles) {
        if (file.size > MAX_FILE_SIZE) {
          return `1ファイルのサイズは10MB以下にしてください。（${file.name}）`;
        }

        const extension = '.' + file.name.split('.').pop()?.toLowerCase();
        if (!ALLOWED_FILE_TYPES.includes(extension)) {
          return `許可されていないファイル形式です。（${file.name}）\\n許可形式: ${ALLOWED_FILE_TYPES.join(', ')}`;
        }
      }

      return null;
    },
    [files]
  );

  const handleFileSelect = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      if (selectedFiles.length === 0) return;

      const validationError = validateFiles(selectedFiles);
      if (validationError) {
        setError(validationError);
        return;
      }

      setFiles(prev => [...prev, ...selectedFiles]);
      setError('');

      // input をクリア
      if (event.target) {
        event.target.value = '';
      }
    },
    [validateFiles]
  );

  const handleRemoveFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError('');
  }, []);

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
    [text, confidential, files]
  );

  const handleSend = useCallback(() => {
    const trimmedText = text.trim();
    if (!trimmedText || disabled || loading) return;

    console.log('ChatInput onSend:', {
      text: trimmedText,
      confidential,
      files,
    });
    onSend(trimmedText, { confidential, files });

    // 外部制御の場合は onChange で空文字を通知、内部制御の場合は直接設定
    if (onChange) {
      onChange('');
    } else {
      setInternalText('');
    }

    setFiles([]);
    setError('');
  }, [text, confidential, files, disabled, loading, onSend, onChange]);

  const canSend = text.trim().length > 0 && !disabled && !loading;

  return (
    <Box>
      {/* エラー表示 */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, maxWidth: 800, mx: 'auto' }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <StyledContainer>
        {/* 機密情報バー */}
        <AlertBar isConfidential={confidential}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {confidential ? (
              <WarningAmberOutlined sx={{ color: '#555' }} />
            ) : (
              <BlockOutlined sx={{ color: '#555' }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {confidential
                ? '入力内容は機密情報扱いとなります。'
                : '機密情報を入力しないモードです。'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Switch
              checked={confidential}
              onChange={e => setConfidential(e.target.checked)}
              size="small"
              aria-label="機密情報入力モードの切り替え"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#6E41FF',
                  '&:hover': {
                    backgroundColor: 'rgba(110, 65, 255, 0.04)',
                  },
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#6E41FF',
                },
              }}
            />
            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
              機密情報を入力
            </Typography>
            <Tooltip title="機密情報の取り扱いについての詳細説明がここに表示されます。機密情報モードでは入力内容が適切にセキュリティ処理されます。">
              <IconButton size="small" aria-label="機密情報について">
                <InfoOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </AlertBar>

        {/* ファイル表示エリア */}
        {files.length > 0 && (
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              添付ファイル ({files.length}/{MAX_FILES})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {files.map((file, index) => (
                <Box
                  key={`${file.name}-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>
                    {file.name}
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => handleRemoveFile(index)}
                    sx={{ minWidth: 'auto', p: 0.25 }}
                    aria-label={`${file.name}を削除`}
                  >
                    ×
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        )}

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
            {/* 画像添付ボタン */}
            <Tooltip title="画像を添付 (PNG, JPG)">
              <IconButton
                onClick={() => imageInputRef.current?.click()}
                disabled={disabled || loading}
                aria-label="画像を添付"
                size="small"
              >
                <Image />
              </IconButton>
            </Tooltip>

            {/* ファイル添付ボタン */}
            <Tooltip title="ファイルを添付 (PDF, Word, Excel, PowerPoint, テキスト)">
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || loading}
                aria-label="ファイルを添付"
                size="small"
              >
                <AttachFile />
              </IconButton>
            </Tooltip>

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

          {/* 隠しファイル入力 */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.pptx,.txt"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <input
            ref={imageInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </InputContainer>
      </StyledContainer>
    </Box>
  );
}
