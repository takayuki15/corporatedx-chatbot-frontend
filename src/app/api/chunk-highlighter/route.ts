import type {
  ChunkHighlighterApiResponse,
  ChunkHighlighterRequest,
  ChunkHighlighterResponse,
  ErrorResponse,
} from '@/lib/api';
import { apiClient } from '@/lib/api';
import { useMockApi } from '@/lib/config';
import { readFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

/**
 * POST /api/chunk-highlighter
 * チャンクハイライトシステムAPI
 * - モックモード: mocks/chunkHighlighter.json からレスポンスを取得
 * - 本番モード: バックエンドAPI /v1/chunk_highlighter にリクエストを送信
 *
 * リクエストボディ:
 * {
 *   "source_file_list": ["S3パス1", "S3パス2"],
 *   "chunk_list": ["チャンク1", "チャンク2"]
 * }
 *
 * 例:
 * POST /api/chunk-highlighter
 * {
 *   "source_file_list": ["markdown/mmc/mm00/keiri/経費精算ガイド.md"],
 *   "chunk_list": ["経費精算の申請期限は、毎月末日までに前月分を提出してください。"]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = (await request.json()) as ChunkHighlighterRequest;

    // 必須パラメータのバリデーション
    if (!Array.isArray(body.source_file_list)) {
      return NextResponse.json(
        { error: 'source_file_list is required and must be an array' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.chunk_list)) {
      return NextResponse.json(
        { error: 'chunk_list is required and must be an array' },
        { status: 400 }
      );
    }

    // 配列の要素数一致チェック
    if (body.source_file_list.length !== body.chunk_list.length) {
      return NextResponse.json(
        {
          error: `chunk_listとsource_file_listの要素数が一致していません。 chunk_list:${body.chunk_list.length} source_file_list:${body.source_file_list.length}`,
        },
        { status: 400 }
      );
    }

    // モックモードの場合
    if (useMockApi) {
      const mockFilePath = join(
        process.cwd(),
        'src',
        'mocks',
        'chunkHighlighter.json'
      );
      const mockData = JSON.parse(readFileSync(mockFilePath, 'utf-8')) as {
        statusCode: number;
        body: ChunkHighlighterResponse;
      };

      return NextResponse.json(mockData.body, { status: mockData.statusCode });
    }

    // 本番モードの場合
    const response = await apiClient.post<ChunkHighlighterApiResponse>(
      '/v1/chunk_highlighter',
      body
    );

    // bodyをパースして {"statusCode": 200, "body": {...}} から body の中身を取得
    const parsedBody: ChunkHighlighterResponse =
      typeof response.body === 'string'
        ? JSON.parse(response.body)
        : response.body;

    return NextResponse.json(parsedBody, { status: 200 });
  } catch (error) {
    console.error('Error in chunk-highlighter API:', error);
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
