import { postJsonWithRetry } from './http-client';

interface TranslatePayload {
  text: string;
  source_language: string;
  target_language: string;
}

export interface TranslationResult {
  translated_text: string;
  confidence?: number;
}

export class TranslationClient {
  private baseUrl: string;
  private timeoutMs: number;
  private retries: number;

  constructor(baseUrl: string, timeoutMs = 10000, retries = 1) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
    this.retries = retries;
  }

  async translate(payload: TranslatePayload): Promise<TranslationResult> {
    return postJsonWithRetry<TranslatePayload, TranslationResult>(
      'translation-service',
      `${this.baseUrl}/api/v1/translate`,
      payload,
      { timeoutMs: this.timeoutMs, retries: this.retries }
    );
  }
}
