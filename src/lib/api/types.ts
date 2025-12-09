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
  department?: string;
  displayName?: string;
  lastLogonTimestamp?: string;
  mail?: string;
  office?: string;
  [key: string]: unknown;
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
 * RAGレスポンスの共通フィールド
 */
interface RagResponseBase {
  session_id: string;
  chat_history: ChatMessage[];
  business_sub_categories: string[];
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
  faq_answer: string[];
  faq_source_files: string[];
  faq_chunk_ids: string[];
  faq_source_texts: string[];
  faq_metadata_list: string[];
}

/**
 * パターン3: RAG回答のみのレスポンス
 */
export interface RagOnlyResponse extends RagResponseBase {
  rag_answer: string;
  rag_source_files: string[];
  rag_chunk_ids: string[];
  rag_source_texts: string[];
  rag_metadata_list: string[];
}

/**
 * パターン4: FAQ + RAG両方のレスポンス
 */
export interface FaqAndRagResponse extends RagResponseBase {
  faq_answer: string[];
  faq_source_files: string[];
  faq_chunk_ids: string[];
  faq_source_texts: string[];
  faq_metadata_list: string[];
  rag_answer: string;
  rag_source_files: string[];
  rag_chunk_ids: string[];
  rag_source_texts: string[];
  rag_metadata_list: string[];
}

/**
 * 全てのRAGレスポンスタイプ
 */
export type RagResponse =
  | NoIndexAvailableResponse
  | FaqOnlyResponse
  | RagOnlyResponse
  | FaqAndRagResponse;
