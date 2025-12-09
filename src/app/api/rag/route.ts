import type {
  ErrorResponse,
  RagApiResponse,
  RagRequest,
  RagResponse,
} from '@/lib/api';
import { apiClient } from '@/lib/api';
import { useMockApi } from '@/lib/config';
import { readFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

/**
 * POST /api/rag
 * RAG自動回答システムAPI
 * - モックモード: mocks/ragFaqAndRag.json からレスポンスを取得
 * - 本番モード: バックエンドAPI /v1/automated_answer にリクエストを送信
 *
 * リクエストボディ:
 * {
 *   "query": "ユーザーの質問内容",
 *   "company_code": "会社コード",
 *   "office_code": "事業所コード",
 *   "session_id": "セッションID (オプション)",
 *   "language": "言語 (オプション)",
 *   ... その他のオプションパラメータ
 * }
 *
 * 例:
 * POST /api/rag
 * {
 *   "query": "経費精算の期限はいつですか？",
 *   "company_code": "MMC",
 *   "office_code": "MM00",
 *   "language": "ja"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = (await request.json()) as RagRequest;

    // 必須パラメータのバリデーション
    if (!body.query || typeof body.query !== 'string' || body.query.trim().length === 0) {
      return NextResponse.json(
        { error: 'query is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (!body.company_code || typeof body.company_code !== 'string') {
      return NextResponse.json(
        { error: 'company_code is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.office_code || typeof body.office_code !== 'string') {
      return NextResponse.json(
        { error: 'office_code is required and must be a string' },
        { status: 400 }
      );
    }

    // オプションパラメータのバリデーション
    if (body.retrieval_mode && !['hybrid', 'bm25', 'cos_sim'].includes(body.retrieval_mode)) {
      return NextResponse.json(
        { error: 'retrieval_mode must be one of: hybrid, bm25, cos_sim' },
        { status: 400 }
      );
    }

    if (body.top_n !== undefined && (body.top_n < 1 || body.top_n > 100)) {
      return NextResponse.json(
        { error: 'top_n must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (body.rrf_k !== undefined && body.rrf_k < 1) {
      return NextResponse.json(
        { error: 'rrf_k must be greater than or equal to 1' },
        { status: 400 }
      );
    }

    if (body.rerank_model_type && !['aoai', 'bedrock'].includes(body.rerank_model_type)) {
      return NextResponse.json(
        { error: 'rerank_model_type must be one of: aoai, bedrock' },
        { status: 400 }
      );
    }

    // LLMパラメータのバリデーション
    if (body.llm_params) {
      const { temperature, frequency_penalty, presence_penalty, top_p, max_tokens } =
        body.llm_params;

      if (temperature !== undefined && (temperature < 0 || temperature > 2)) {
        return NextResponse.json(
          { error: 'llm_params.temperature must be between 0.0 and 2.0' },
          { status: 400 }
        );
      }

      if (frequency_penalty !== undefined && (frequency_penalty < -2 || frequency_penalty > 2)) {
        return NextResponse.json(
          { error: 'llm_params.frequency_penalty must be between -2.0 and 2.0' },
          { status: 400 }
        );
      }

      if (presence_penalty !== undefined && (presence_penalty < -2 || presence_penalty > 2)) {
        return NextResponse.json(
          { error: 'llm_params.presence_penalty must be between -2.0 and 2.0' },
          { status: 400 }
        );
      }

      if (top_p !== undefined && (top_p < 0 || top_p > 1)) {
        return NextResponse.json(
          { error: 'llm_params.top_p must be between 0.0 and 1.0' },
          { status: 400 }
        );
      }

      if (max_tokens !== undefined && (max_tokens < 1 || max_tokens > 128000)) {
        return NextResponse.json(
          { error: 'llm_params.max_tokens must be between 1 and 128000' },
          { status: 400 }
        );
      }
    }

    // モックモードの場合
    if (useMockApi) {
      const mockFilePath = join(
        process.cwd(),
        'src',
        'mocks',
        'ragFaqAndRag.json'
      );
      const mockData = JSON.parse(readFileSync(mockFilePath, 'utf-8')) as {
        statusCode: number;
        body: RagResponse;
      };

      return NextResponse.json(mockData.body, { status: mockData.statusCode });
    }

    // 本番モードの場合
    const response = await apiClient.post<RagApiResponse>(
      '/v1/automated_answer',
      body
    );

    // bodyをパースして {"statusCode": 200, "body": {...}} から body の中身を取得
    const parsedBody: RagResponse =
      typeof response.body === 'string'
        ? JSON.parse(response.body)
        : response.body;

    return NextResponse.json(parsedBody, { status: 200 });
  } catch (error) {
    console.error('Error in RAG API:', error);
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
