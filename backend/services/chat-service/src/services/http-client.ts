export class ExternalServiceError extends Error {
  service: string;
  status?: number;
  retryable: boolean;

  constructor(service: string, message: string, status?: number, retryable = false) {
    super(message);
    this.name = 'ExternalServiceError';
    this.service = service;
    this.status = status;
    this.retryable = retryable;
  }
}

interface RequestOptions {
  timeoutMs: number;
  retries: number;
}

export async function postJsonWithRetry<TRequest, TResponse>(
  service: string,
  url: string,
  body: TRequest,
  options: RequestOptions
): Promise<TResponse> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= options.retries; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!response.ok) {
        const rawError = await response.text();
        const message = `${service} request failed with ${response.status}${rawError ? `: ${rawError}` : ''}`;
        const retryable = response.status >= 500;

        if (retryable && attempt < options.retries) {
          continue;
        }

        throw new ExternalServiceError(service, message, response.status, retryable);
      }

      return await response.json() as TResponse;
    } catch (error) {
      if (error instanceof ExternalServiceError) {
        throw error;
      }

      const isAbort = error instanceof Error && error.name === 'AbortError';
      const message = isAbort
        ? `${service} request timed out after ${options.timeoutMs}ms`
        : `${service} request failed`;
      const retryable = true;

      lastError = new ExternalServiceError(service, message, undefined, retryable);

      if (attempt >= options.retries) {
        break;
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new ExternalServiceError(service, `${service} request failed`, undefined, true);
}
