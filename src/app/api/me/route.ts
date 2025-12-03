import type { ErrorResponse, User } from '@/lib/api';
import { useMockApi } from '@/lib/config';
import { readFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

/**
 * GET /api/me
 * 現在ログイン中のユーザー情報を取得
 *
 * - モックモード: mocks/user.json からユーザー情報を取得
 * - 本番モード: ALBヘッダー x-amzn-oidc-accesstoken からユーザー情報を取得

 */
export async function GET(request: NextRequest) {
  try {
    // モックモードの場合
    if (useMockApi) {
      const userJsonPath = join(process.cwd(), 'src', 'mocks', 'user.json');
      const userData = JSON.parse(readFileSync(userJsonPath, 'utf-8')) as User;
      return NextResponse.json(userData, { status: 200 });
    }

    // 本番モード: ALBヘッダーから取得
    const oidcDataHeader = request.headers.get('x-amzn-oidc-accesstoken');

    if (!oidcDataHeader) {
      return NextResponse.json(
        {
          error:
            'x-amzn-oidc-accesstoken header not found. Make sure you are behind ALB with OIDC authentication.',
        },
        { status: 401 }
      );
    }

    // JWTをデコード（base64）してメールアドレスを取得
    const payload = JSON.parse(
      Buffer.from(oidcDataHeader.split('.')[1], 'base64').toString()
    );

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    return NextResponse.json(error as ErrorResponse, { status: 500 });
  }
}
