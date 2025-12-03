/**
 * Application Configuration
 * 環境変数から設定を読み込む
 */

/**
 * モックAPIを使用するかどうか
 * NODE_ENV=development かつ USE_MOCK_API=true の場合にモックを使用
 */
export const useMockApi =
  process.env.NODE_ENV === 'development' &&
  process.env.USE_MOCK_API === 'true';

/**
 * バックエンドAPIのベースURL
 */
export const backendApiUrl =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

/**
 * API Gateway ID
 */
export const apiGatewayId = process.env.NEXT_PUBLIC_API_GATEWAY_ID;

/**
 * 設定を表示（デバッグ用）
 */
export function logConfig() {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Config]', {
      useMockApi,
      backendApiUrl,
      hasApiGatewayId: !!apiGatewayId,
    });
  }
}
