/**
 * API Response Types
 * バックエンドAPIのレスポンス型定義
 */

/**
 * 共通APIレスポンス
 */
export interface ApiResponse<T> {
  statusCode: number;
  body: T;
}

/**
 * エラーレスポンス
 * バックエンドAPIから返されるエラーの形式
 */
export interface ErrorResponse {
  error: string;
}

/**
 * User型
 * ユーザーの詳細情報
 */
export interface User {
  name: string;
  unique_name: string;
}

/**
 * Employee型
 * 従業員の詳細情報
 */
export interface Employee {
  name?: string;
  company?: string;
  company_code?: string;
  office_code?: string;
  department?: string;
  displayName?: string;
  lastLogonTimestamp?: string;
  mail?: string;
  office?: string;
  [key: string]: unknown;
}

/**
 * EmployeeResponse型
 * バックエンドAPIから返される従業員情報のレスポンス構造
 */
export interface EmployeeResponse {
  employee: Employee;
}

/**
 * EmployeeApiResponse型
 * バックエンドAPIの生レスポンス（bodyがJSON文字列）
 */
export interface EmployeeApiResponse {
  statusCode: number;
  body: string; // JSON文字列: {"employee": {...}}
}

/**
 * RAG API Types
 */

/**
 * チャット履歴の単一メッセージ
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * LLMパラメータ
 */
export interface LlmParams {
  temperature?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  top_p?: number;
  max_tokens?: number;
  reasoning_effort?: 'minimal' | 'low' | 'medium' | 'high';
  verbosity?: 'low' | 'medium' | 'high';
}

/**
 * RAG APIリクエスト
 */
export interface RagRequest {
  // 必須パラメータ
  query: string;
  company: string;
  office: string;
  miam_id: string;

  // オプションパラメータ
  session_id?: string;
  language?: string;
  business_sub_category_top_n?: number;
  business_sub_category_query_expansion_model?: string;
  business_sub_category_retrieval_mode?: 'hybrid' | 'bm25' | 'cos_sim';
  business_sub_category_retrieval_model?: string | null;
  business_sub_category_rerank_model?: string;
  answer_top_n?: number;
  answer_query_expansion_model?: string;
  answer_model?: string;
  answer_retrieval_mode?: 'hybrid' | 'bm25' | 'cos_sim';
  answer_retrieval_model?: string | null;
  answer_rerank_model?: string;
  is_query_expansion?: boolean;
  is_rerank?: boolean;
  system_message?: string | null;
  rrf_k?: number;
  llm_params?: LlmParams;
}

/**
 * 有人窓口情報（従来のDynamoDB構造、削除予定）
 * @deprecated 新しいAPIでは priority_manned_counter_names を使用
 */
export interface MannedCounterInfo {
  business_sub_category: string;
  manned_counter_name?: string;
  manned_counter_email?: string;
  manned_counter_description?: string;
  is_office_access_only?: boolean;
}

/**
 * FAQ結果オブジェクト（v1.1.0: ネスト構造）
 */
export interface FaqResult {
  answer: string[];
  source_files: string[];
  chunk_ids: string[];
  source_texts: string[];
  metadata_list: string[];
}

/**
 * RAG結果オブジェクト（v1.1.0: ネスト構造）
 */
export interface RagResult {
  answer: string;
  source_files: string[];
  chunk_ids: string[];
  source_texts: string[];
  metadata_list: string[];
}

/**
 * RAGレスポンスの共通フィールド
 */
interface RagResponseBase {
  session_id: string;
  chat_history: ChatMessage[];
  business_sub_categories: string[];
  priority_manned_counter_names: string[];
  userQuery?: string; // フロントエンド側で追加するユーザーの質問文
}

/**
 * パターン1: インデックスが存在しない場合のレスポンス
 */
export interface NoIndexAvailableResponse extends RagResponseBase {
  message: string;
  no_index_available: true;
}

/**
 * パターン2: FAQ回答のみのレスポンス
 */
export interface FaqOnlyResponse extends RagResponseBase {
  faq: FaqResult;
}

/**
 * パターン3: RAG回答のみのレスポンス
 */
export interface RagOnlyResponse extends RagResponseBase {
  rag: RagResult;
}

/**
 * パターン4: FAQ + RAG両方のレスポンス
 */
export interface FaqAndRagResponse extends RagResponseBase {
  faq: FaqResult;
  rag: RagResult;
}

/**
 * 全てのRAGレスポンスタイプ
 */
export type RagResponse =
  | NoIndexAvailableResponse
  | FaqOnlyResponse
  | RagOnlyResponse
  | FaqAndRagResponse;

/**
 * バックエンドAPIの生レスポンス（bodyがJSON文字列の場合）
 */
export interface RagApiResponse {
  statusCode: number;
  body: string; // JSON文字列
}

/**
 * メール送信API関連の型定義
 */

/**
 * メール添付ファイル
 */
export interface MailFile {
  file_name: string;
  file_data: string; // Base64エンコード
}

/**
 * メール送信リクエスト
 */
export interface SendMailRequest {
  questioner_email: string;
  manned_counter_name: string;
  company: string;
  office: string;
  mail_content: string;
  manned_counter_email: string;
  is_office_access_only: boolean;
  mail_file?: MailFile[];
}

/**
 * メール送信レスポンス
 */
export interface SendMailResponse {
  sent_text: string;
}

/**
 * メール送信APIの生レスポンス（bodyがJSON文字列の場合）
 */
export interface SendMailApiResponse {
  statusCode: number;
  body: string; // JSON文字列: {"sent_text": "..."}
}

/**
 * 有人窓口情報取得API関連の型定義
 */

/**
 * 有人窓口情報取得リクエスト
 */
export interface GetMannedCounterRequest {
  priority_manned_counter_names: string[];
  company: string;
  office: string;
}

/**
 * 有人窓口情報オブジェクト
 */
export interface MannedCounterDetail {
  manned_counter_name: string;
  manned_counter_email: string;
  manned_counter_description: string;
  [key: string]: unknown; // DynamoDBの追加フィールド
}

/**
 * 有人窓口情報取得レスポンス
 */
export interface GetMannedCounterResponse {
  manned_counter_info: MannedCounterDetail[];
}

/**
 * 有人窓口情報取得APIの生レスポンス（bodyがJSON文字列の場合）
 */
export interface GetMannedCounterApiResponse {
  statusCode: number;
  body: string; // JSON文字列: {"manned_counter_info": [...]}
}

/**
 * チャンクハイライトAPI関連の型定義
 */

/**
 * チャンクハイライトリクエスト
 */
export interface ChunkHighlighterRequest {
  source_file_list: string[];
  chunk_list: string[];
}

/**
 * チャンクハイライトレスポンス
 */
export interface ChunkHighlighterResponse {
  s3_path: string[];
  html: string[];
}

/**
 * チャンクハイライトAPIの生レスポンス（bodyがJSON文字列の場合）
 */
export interface ChunkHighlighterApiResponse {
  statusCode: number;
  body: string; // JSON文字列: {"s3_path": [...], "html": [...]}
}
