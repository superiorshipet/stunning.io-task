export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://stunningio-task-production.up.railway.app').replace(/\/$/, '');

function resolveApiUrl(endpoint: string): string {
  if (/^https?:\/\//i.test(endpoint)) {
    return endpoint;
  }

  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(resolveApiUrl(endpoint), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new ApiError(response.status, errorData?.title || errorData?.detail || `API error ${response.status}`, errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export async function streamApi(
  endpoint: string,
  body: unknown,
  onChunk: (content: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  try {
    const response = await fetch(resolveApiUrl(endpoint), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(body),
      signal,
    });

    if (!response.ok) {
      let message = `Streaming failed: HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        message = errorData?.detail || errorData?.title || message;
      } catch {
        try {
          const text = await response.text();
          message = text || message;
        } catch {
          // Keep the HTTP status fallback.
        }
      }
      throw new Error(message);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported on this response.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.replace(/^data:\s*/, '');
        if (dataStr === '[DONE]') {
          onDone();
          return;
        }

        let parsed: { Type?: string; Content?: string } | null = null;
        try {
          parsed = JSON.parse(dataStr);
        } catch {
          onChunk(dataStr);
          continue;
        }

        if (parsed.Type === 'delta' && parsed.Content) {
          onChunk(parsed.Content);
        } else if (parsed.Type === 'error') {
          throw new Error(parsed.Content || 'AI generation failed.');
        } else if (parsed.Type === 'done') {
          onDone();
          return;
        }
      }
    }

    onDone();
  } catch (err) {
    if (signal?.aborted) return;
    onError(err instanceof Error ? err : new Error(String(err)));
  }
}
