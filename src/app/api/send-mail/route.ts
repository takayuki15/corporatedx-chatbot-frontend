import type {
  ErrorResponse,
  SendMailApiResponse,
  SendMailRequest,
  SendMailResponse,
} from '@/lib/api';
import { apiClient } from '@/lib/api';
import { useMockApi } from '@/lib/config';
import { readFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

/**
 * POST /api/send-mail
 * SESメール送信API
 * - モックモード: mocks/sendMail.json からレスポンスを取得
 * - 本番モード: バックエンドAPI /v1/send-mail にリクエストを送信
 *
 * リクエストボディ:
 * {
 *   "questioner_email": "問い合わせ者のメールアドレス",
 *   "business_sub_category": "業務小分類",
 *   "company_cd": "会社コード",
 *   "office_cd": "事業所コード",
 *   "mail_content": "メール本文",
 *   "manned_counter_email": "有人窓口のメールアドレス",
 *   "is_office_access_only": true/false,
 *   "mail_file": [{ "file_name": "...", "file_data": "..." }] // オプション
 * }
 *
 * 例:
 * POST /api/send-mail
 * {
 *   "questioner_email": "user@example.com",
 *   "business_sub_category": "経費精算",
 *   "company_cd": "ALLJPN",
 *   "office_cd": "MM00",
 *   "mail_content": "経費精算の期限について教えてください。",
 *   "manned_counter_email": "expenses@example.com",
 *   "is_office_access_only": true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const body = (await request.json()) as SendMailRequest;

    // 必須パラメータのバリデーション
    if (!body.questioner_email || typeof body.questioner_email !== 'string') {
      return NextResponse.json(
        { error: 'questioner_email is required and must be a string' },
        { status: 400 }
      );
    }

    if (
      !body.business_sub_category ||
      typeof body.business_sub_category !== 'string'
    ) {
      return NextResponse.json(
        { error: 'business_sub_category is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.company_cd || typeof body.company_cd !== 'string') {
      return NextResponse.json(
        { error: 'company_cd is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.office_cd || typeof body.office_cd !== 'string') {
      return NextResponse.json(
        { error: 'office_cd is required and must be a string' },
        { status: 400 }
      );
    }

    if (!body.mail_content || typeof body.mail_content !== 'string') {
      return NextResponse.json(
        { error: 'mail_content is required and must be a string' },
        { status: 400 }
      );
    }

    if (
      !body.manned_counter_email ||
      typeof body.manned_counter_email !== 'string'
    ) {
      return NextResponse.json(
        { error: 'manned_counter_email is required and must be a string' },
        { status: 400 }
      );
    }

    if (typeof body.is_office_access_only !== 'boolean') {
      return NextResponse.json(
        { error: 'is_office_access_only is required and must be a boolean' },
        { status: 400 }
      );
    }

    // オプションパラメータのバリデーション
    if (body.mail_file !== undefined) {
      if (!Array.isArray(body.mail_file)) {
        return NextResponse.json(
          { error: 'mail_file must be an array' },
          { status: 400 }
        );
      }

      for (const file of body.mail_file) {
        if (!file.file_name || typeof file.file_name !== 'string') {
          return NextResponse.json(
            { error: 'mail_file[].file_name is required and must be a string' },
            { status: 400 }
          );
        }

        if (!file.file_data || typeof file.file_data !== 'string') {
          return NextResponse.json(
            { error: 'mail_file[].file_data is required and must be a string' },
            { status: 400 }
          );
        }
      }
    }

    // モックモードの場合
    if (useMockApi) {
      const mockFilePath = join(process.cwd(), 'src', 'mocks', 'sendMail.json');
      const mockData = JSON.parse(readFileSync(mockFilePath, 'utf-8')) as {
        statusCode: number;
        body: SendMailResponse;
      };

      return NextResponse.json(mockData.body, { status: mockData.statusCode });
    }

    // 本番モードの場合
    const response = await apiClient.post<SendMailApiResponse>(
      '/v1/send-mail',
      body
    );

    // bodyをパースして {"statusCode": 200, "body": "{\"sent_text\": \"...\"}"} から body の中身を取得
    const parsedBody: SendMailResponse =
      typeof response.body === 'string'
        ? JSON.parse(response.body)
        : response.body;

    return NextResponse.json(parsedBody, { status: 200 });
  } catch (error) {
    console.error('Error in send-mail API:', error);
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
