export class ApiError extends Error {
  readonly status?: number;
  readonly retryable: boolean;

  constructor(
    message: string,
    options: { status?: number; retryable?: boolean; cause?: unknown } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.status = options.status;
    this.retryable = options.retryable ?? false;
  }
}

function isRetryableStatus(status: number): boolean {
  return status >= 500 || status === 429;
}

export async function getJson(url: URL, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { signal });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError("Could not reach the API. Check your connection and try again.", {
      retryable: true,
      cause: error,
    });
  }

  if (!response.ok) {
    throw new ApiError(`The API responded with status ${response.status}.`, {
      status: response.status,
      retryable: isRetryableStatus(response.status),
    });
  }

  try {
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError("The API returned a response that is not valid JSON.", {
      status: response.status,
      cause: error,
    });
  }
}
