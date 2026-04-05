/**
 * IPFS Gateway Rate-Limit Handling & Retry Logic
 *
 * Provides exponential backoff with full jitter for transient IPFS errors:
 *   - 429 Too Many Requests (rate limit exceeded)
 *   - 503 Service Unavailable
 *   - 502 / 504 Gateway errors
 *   - Network-level failures (no response)
 *
 * The caller receives a `Retry-After` hint when the gateway supplies one.
 */

/** HTTP status codes that warrant an automatic retry. */
export const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504]);

export interface RetryOptions {
  /** Maximum number of attempts (including the initial attempt). Default: 4 */
  maxAttempts?: number;
  /** Base delay in milliseconds for exponential back-off. Default: 500 */
  baseDelayMs?: number;
  /** Maximum delay cap in milliseconds. Default: 30_000 */
  maxDelayMs?: number;
  /**
   * Optional override for the delay function — useful in tests to avoid
   * real timers. Receives the computed delay (ms) and returns a Promise.
   */
  delayFn?: (ms: number) => Promise<void>;
}

/** Thrown when all retry attempts have been exhausted. */
export class IpfsRateLimitError extends Error {
  constructor(
    public readonly attempts: number,
    public readonly lastStatus: number | undefined,
    message: string,
    /** The original error that caused the final failure. */
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = "IpfsRateLimitError";
  }
}

/** Default real-time delay implementation. */
const realDelay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Computes the next back-off delay using exponential back-off with full jitter.
 *
 * Formula: min(maxDelayMs, baseDelayMs * 2^attempt) * random(0, 1)
 *
 * @param attempt Zero-indexed attempt number (0 = first retry).
 * @param baseDelayMs Base delay in ms.
 * @param maxDelayMs Upper delay cap in ms.
 * @returns Delay in milliseconds.
 */
export function computeBackoffDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
): number {
  const exponential = baseDelayMs * Math.pow(2, attempt);
  const capped = Math.min(exponential, maxDelayMs);
  // Full jitter: random value in [0, capped)
  return Math.random() * capped;
}

/**
 * Parses the `Retry-After` header and returns the delay in milliseconds.
 * Supports both delta-seconds (integer) and HTTP-date formats.
 * Returns `undefined` if the header is absent or unparseable.
 */
export function parseRetryAfterMs(
  retryAfterHeader: string | null | undefined,
): number | undefined {
  if (!retryAfterHeader) return undefined;

  const seconds = parseInt(retryAfterHeader, 10);
  if (!isNaN(seconds) && seconds >= 0) {
    return seconds * 1_000;
  }

  // HTTP-date format
  const futureTime = new Date(retryAfterHeader).getTime();
  if (!isNaN(futureTime)) {
    const waitMs = futureTime - Date.now();
    return waitMs > 0 ? waitMs : 0;
  }

  return undefined;
}

/**
 * Wraps an async operation with retry logic for IPFS rate-limit and gateway
 * transient errors.
 *
 * @param operation An async factory that receives the current attempt index
 *   (0-indexed) and returns a value `T`.
 * @param options   Retry configuration.
 * @returns The result of the first successful `operation` call.
 * @throws {IpfsRateLimitError} When `maxAttempts` is exhausted.
 * @throws Re-throws any non-retryable error immediately.
 */
export async function withIpfsRetry<T>(
  operation: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 4,
    baseDelayMs = 500,
    maxDelayMs = 30_000,
    delayFn = realDelay,
  } = options;

  let lastStatus: number | undefined;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await operation(attempt);
    } catch (error: unknown) {
      // ------------------------------------------------------------------
      // Determine whether this error is retryable
      // ------------------------------------------------------------------
      if (error instanceof IpfsGatewayResponseError) {
        lastStatus = error.status;
        lastError = error;

        if (!RETRYABLE_STATUS_CODES.has(error.status)) {
          // Non-transient HTTP error — surface immediately
          throw error;
        }

        // Honour gateway's Retry-After hint if present
        const retryAfterMs = parseRetryAfterMs(error.retryAfterHeader);

        if (attempt < maxAttempts - 1) {
          const backoff = computeBackoffDelay(attempt, baseDelayMs, maxDelayMs);
          const delay =
            retryAfterMs !== undefined
              ? Math.max(retryAfterMs, backoff)
              : backoff;
          await delayFn(delay);
          continue;
        }
      } else if (error instanceof Error) {
        // Network-level error (no HTTP response) — always retryable
        lastError = error;
        if (attempt < maxAttempts - 1) {
          const delay = computeBackoffDelay(attempt, baseDelayMs, maxDelayMs);
          await delayFn(delay);
          continue;
        }
      } else {
        throw error;
      }

      // All attempts exhausted
      throw new IpfsRateLimitError(
        attempt + 1,
        lastStatus,
        `IPFS operation failed after ${attempt + 1} attempt(s). Last status: ${lastStatus ?? "network error"}.`,
        lastError,
      );
    }
  }

  // TypeScript requires an explicit unreachable path
  /* c8 ignore next */
  throw new IpfsRateLimitError(maxAttempts, lastStatus, "Unreachable.", lastError);
}

/**
 * Sentinel error class used internally to carry HTTP response metadata
 * through the retry boundary.
 */
export class IpfsGatewayResponseError extends Error {
  constructor(
    public readonly status: number,
    public readonly retryAfterHeader: string | null,
    message: string,
  ) {
    super(message);
    this.name = "IpfsGatewayResponseError";
  }
}
