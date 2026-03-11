import { postJsonWithRetry } from './http-client';

interface SynthesizePayload {
  text: string;
  language: string;
  voice?: string;
  transcription_id: string;
  meeting_id: string;
  user_id: string;
  speed: number;
  pitch: number;
}

export interface TtsResult {
  audio_data: string;
  format: string;
  language: string;
  duration_seconds: number;
  provider: string;
}

export class TtsClient {
  private baseUrl: string;
  private timeoutMs: number;
  private retries: number;

  constructor(baseUrl: string, timeoutMs = 10000, retries = 1) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
    this.retries = retries;
  }

  async synthesize(payload: SynthesizePayload): Promise<TtsResult> {
    return postJsonWithRetry<SynthesizePayload, TtsResult>(
      'tts-service',
      `${this.baseUrl}/api/v1/synthesis/synthesize`,
      payload,
      { timeoutMs: this.timeoutMs, retries: this.retries }
    );
  }
}
