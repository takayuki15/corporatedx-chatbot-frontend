import type {
  ErrorResponse,
  GetMannedCounterApiResponse,
  GetMannedCounterRequest,
  GetMannedCounterResponse,
} from '@/lib/api';
import { apiClient } from '@/lib/api';
import { useMockApi } from '@/lib/config';
import { readFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

/**
 * POST /api/manned-counters
 * 有人窓口情報取得API
 * - モックモード: mocks/getMannedCounter.json からレスポンスを取得
 * - 本番モード: バックエンドAPI /v1/get_manned_counter にリクエストを送信
 *
 * リクエストボディ:
 * {
 *   "priority_manned_counter_names": ["窓口名1", "窓口名2"],
 *   "company": "会社コード",
 *   "office": "事業所コード"
 * }
 *
 * 例:
 * POST /api/manned-counters
 * {
 *   "priority_manned_counter_names": ["経理窓口", "総務課"],
 *   "company": "MMC",
 *   "office": "MM00"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = (await request.json()) as GetMannedCounterRequest;

    // 必須パラメータのバリデーション
    if (!Array.isArray(body.priority_manned_counter_names)) {
      return NextResponse.json(
        { error: 'priority_manned_counter_names is required and must be an array' },
        { status: 400 }
      );
    }

    if (!body.company || typeof body.company !== 'string') {
      return NextResponse.json(
        { error: 'company is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.office || typeof body.office !== 'string') {
      return NextResponse.json(
        { error: 'office is required and must be a string' },
        { status: 400 }
      );
    }

    // モックモードの場合
    if (useMockApi) {
      const mockFilePath = join(
        process.cwd(),
        'src',
        'mocks',
        'getMannedCounter.json'
      );
      const mockData = JSON.parse(readFileSync(mockFilePath, 'utf-8')) as {
        statusCode: number;
        body: GetMannedCounterResponse;
      };

      return NextResponse.json(mockData.body, { status: mockData.statusCode });
    }

    // 本番モードの場合
    const response = await apiClient.post<GetMannedCounterApiResponse>(
      '/v1/get_manned_counter',
      body
    );

    // bodyをパースして {"statusCode": 200, "body": {...}} から body の中身を取得
    const parsedBody: GetMannedCounterResponse =
      typeof response.body === 'string'
        ? JSON.parse(response.body)
        : response.body;

    return NextResponse.json(parsedBody, { status: 200 });
  } catch (error) {
    console.error('Error in get_manned_counter API:', error);
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
