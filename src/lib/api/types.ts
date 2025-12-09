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
  company_code: string;
  office_code: string;

  // オプションパラメータ
  session_id?: string;
  model_name?: string;
  language?: string;
  retrieval_mode?: 'hybrid' | 'bm25' | 'cos_sim';
  top_n?: number;
  rrf_k?: number;
  is_query_expansion?: boolean;
  rerank_model_type?: 'aoai' | 'bedrock';
  bedrock_model_name?: string;
  system_message?: string | null;
  llm_params?: LlmParams;
}

/**
 * 有人窓口情報
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
  manned_counter_info: MannedCounterInfo[];
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
