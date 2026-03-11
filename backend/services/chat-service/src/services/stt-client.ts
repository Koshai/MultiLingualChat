import { postJsonWithRetry } from './http-client';

export interface SttTranscriptionResult {
  id: string;
  text: string;
  language: string;
  segments?: unknown[];
  confidence?: number;
}

interface TranscribePayload {
  audio_data: string;
  language: string | null;
  meeting_id: string;
  user_id: string;
}

export class SttClient {
  private baseUrl: string;
  private timeoutMs: number;
  private retries: number;

  constructor(baseUrl: string, timeoutMs = 10000, retries = 1) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
    this.retries = retries;
  }

  async transcribe(payload: TranscribePayload): Promise<SttTranscriptionResult> {
    return postJsonWithRetry<TranscribePayload, SttTranscriptionResult>(
      'stt-service',
      `${this.baseUrl}/api/v1/transcription/transcribe`,
      payload,
      { timeoutMs: this.timeoutMs, retries: this.retries }
    );
  }
}
