import type {
  ErrorResponse,
  SubmitFeedbackApiResponse,
  SubmitFeedbackRequest,
  SubmitFeedbackResponse,
} from '@/lib/api';
import { apiClient } from '@/lib/api';
import { useMockApi } from '@/lib/config';
import { readFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

/**
 * POST /api/submit-feedback
 * フィードバック送信API
 * - モックモード: mocks/submitFeedback.json からレスポンスを取得
 * - 本番モード: バックエンドAPI /v1/submit_feedback にリクエストを送信
 *
 * リクエストボディ:
 * {
 *   "session_id": "セッションID (UUIDv4形式を推奨)",
 *   "conversation_time": "会話時刻 (日本時刻JST + UUID形式)",
 *   "feedback": "good" または "bad",
 *   "feedback_reason": "フィードバックの理由 (オプション)"
 * }
 *
 * 例:
 * POST /api/submit-feedback
 * {
 *   "session_id": "550e8400-e29b-41d4-a716-446655440000",
 *   "conversation_time": "2025-12-11T10:30:00+09:00_a1b2c3d4-e5f6-7890",
 *   "feedback": "good"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = (await request.json()) as SubmitFeedbackRequest;

    // 必須パラメータのバリデーション
    if (!body.session_id || typeof body.session_id !== 'string') {
      return NextResponse.json(
        { error: 'session_id is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.conversation_time || typeof body.conversation_time !== 'string') {
      return NextResponse.json(
        { error: 'conversation_time is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.feedback || typeof body.feedback !== 'string') {
      return NextResponse.json(
        { error: 'feedback is required and must be a string' },
        { status: 400 }
      );
    }

    if (body.feedback !== 'good' && body.feedback !== 'bad') {
      return NextResponse.json(
        {
          error: `feedback must be 'good' or 'bad', got: ${body.feedback}`,
        },
        { status: 400 }
      );
    }

    // オプションパラメータのバリデーション
    if (
      body.feedback_reason !== undefined &&
      typeof body.feedback_reason !== 'string'
    ) {
      return NextResponse.json(
        { error: 'feedback_reason must be a string' },
        { status: 400 }
      );
    }

    // モックモードの場合
    if (useMockApi) {
      const mockFilePath = join(
        process.cwd(),
        'src',
        'mocks',
        'submitFeedback.json'
      );
      const mockData = JSON.parse(readFileSync(mockFilePath, 'utf-8')) as {
        statusCode: number;
        body: SubmitFeedbackResponse;
      };

      return NextResponse.json(mockData.body, { status: mockData.statusCode });
    }

    // 本番モードの場合
    const response = await apiClient.post<SubmitFeedbackApiResponse>(
      '/v1/submit_feedback',
      body
    );

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in submit-feedback API:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    // ErrorResponseの形式でエラーを返す
    if (error && typeof error === 'object' && 'error' in error) {
      return NextResponse.json(error as ErrorResponse, { status: 500 });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
