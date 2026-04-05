import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  withIpfsRetry,
  computeBackoffDelay,
  parseRetryAfterMs,
  IpfsRateLimitError,
  IpfsGatewayResponseError,
  RETRYABLE_STATUS_CODES,
} from "./ipfs-retry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Instant delay stub — resolves immediately, no real timers needed. */
const instantDelay = () => Promise.resolve();

/** Build a mock operation that fails N times then succeeds. */
function makeFlaky(
  failCount: number,
  failWith: () => Error,
  successValue: string = "ok",
) {
  let calls = 0;
  return vi.fn(async () => {
    calls++;
    if (calls <= failCount) throw failWith();
    return successValue;
  });
}

// ---------------------------------------------------------------------------
// computeBackoffDelay
// ---------------------------------------------------------------------------

describe("computeBackoffDelay", () => {
  it("returns a value in [0, baseDelayMs * 2^attempt)", () => {
    for (let attempt = 0; attempt < 6; attempt++) {
      const delay = computeBackoffDelay(attempt, 500, 30_000);
      const max = Math.min(500 * Math.pow(2, attempt), 30_000);
      expect(delay).toBeGreaterThanOrEqual(0);
      expect(delay).toBeLessThan(max + 1); // +1 for float rounding
    }
  });

  it("never exceeds maxDelayMs", () => {
    for (let attempt = 0; attempt < 20; attempt++) {
      const delay = computeBackoffDelay(attempt, 500, 1_000);
      expect(delay).toBeLessThanOrEqual(1_000);
    }
  });

  it("returns 0 when baseDelayMs is 0", () => {
    expect(computeBackoffDelay(3, 0, 30_000)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// parseRetryAfterMs
// ---------------------------------------------------------------------------

describe("parseRetryAfterMs", () => {
  it("returns undefined for null/undefined/empty", () => {
    expect(parseRetryAfterMs(null)).toBeUndefined();
    expect(parseRetryAfterMs(undefined)).toBeUndefined();
    expect(parseRetryAfterMs("")).toBeUndefined();
  });

  it("parses delta-seconds correctly", () => {
    expect(parseRetryAfterMs("5")).toBe(5_000);
    expect(parseRetryAfterMs("0")).toBe(0);
    expect(parseRetryAfterMs("120")).toBe(120_000);
  });

  it("parses HTTP-date format into a reasonable positive ms value", () => {
    const future = new Date(Date.now() + 10_000);
    const result = parseRetryAfterMs(future.toUTCString());
    // Should be close to 10_000 ms (allow 500 ms tolerance for test overhead)
    expect(result).toBeGreaterThan(9_000);
    expect(result).toBeLessThan(11_000);
  });

  it("returns 0 for past HTTP-date", () => {
    const past = new Date(Date.now() - 5_000);
    expect(parseRetryAfterMs(past.toUTCString())).toBe(0);
  });

  it("returns undefined for garbage string", () => {
    expect(parseRetryAfterMs("not-a-date-or-number")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// withIpfsRetry — success paths
// ---------------------------------------------------------------------------

describe("withIpfsRetry — success", () => {
  it("resolves immediately when the operation succeeds on the first attempt", async () => {
    const op = vi.fn().mockResolvedValue("cid-123");
    const result = await withIpfsRetry(op, { delayFn: instantDelay });
    expect(result).toBe("cid-123");
    expect(op).toHaveBeenCalledTimes(1);
  });

  it("passes the current attempt index to the operation", async () => {
    const attempts: number[] = [];
    const op = vi.fn(async (attempt: number) => {
      attempts.push(attempt);
      if (attempt < 2) {
        throw new IpfsGatewayResponseError(429, null, "rate limited");
      }
      return "done";
    });
    await withIpfsRetry(op, { maxAttempts: 4, delayFn: instantDelay });
    expect(attempts).toEqual([0, 1, 2]);
  });
});

// ---------------------------------------------------------------------------
// withIpfsRetry — retry on retryable status codes
// ---------------------------------------------------------------------------

describe("withIpfsRetry — retryable status codes", () => {
  it.each(Array.from(RETRYABLE_STATUS_CODES))(
    "retries on HTTP %i and succeeds",
    async (status) => {
      const op = makeFlaky(
        2,
        () => new IpfsGatewayResponseError(status, null, `HTTP ${status}`),
      );
      const result = await withIpfsRetry(op, {
        maxAttempts: 4,
        delayFn: instantDelay,
      });
      expect(result).toBe("ok");
      expect(op).toHaveBeenCalledTimes(3);
    },
  );

  it("honours the Retry-After header when present", async () => {
    const delays: number[] = [];
    const delayFn = (ms: number) => {
      delays.push(ms);
      return Promise.resolve();
    };

    const op = makeFlaky(
      1,
      () => new IpfsGatewayResponseError(429, "2", "rate limited"),
    );
    await withIpfsRetry(op, { maxAttempts: 4, delayFn });

    // The first retry delay must be at least the Retry-After value (2 s = 2000 ms)
    expect(delays[0]).toBeGreaterThanOrEqual(2_000);
  });

  it("retries on network-level errors (no HTTP status)", async () => {
    const op = makeFlaky(2, () => new Error("ECONNRESET"));
    const result = await withIpfsRetry(op, {
      maxAttempts: 4,
      delayFn: instantDelay,
    });
    expect(result).toBe("ok");
    expect(op).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// withIpfsRetry — exhaustion
// ---------------------------------------------------------------------------

describe("withIpfsRetry — exhaustion", () => {
  it("throws IpfsRateLimitError after maxAttempts are exhausted (HTTP 429)", async () => {
    const op = vi
      .fn()
      .mockRejectedValue(new IpfsGatewayResponseError(429, null, "slow down"));

    await expect(
      withIpfsRetry(op, { maxAttempts: 3, delayFn: instantDelay }),
    ).rejects.toThrow(IpfsRateLimitError);

    expect(op).toHaveBeenCalledTimes(3);
  });

  it("IpfsRateLimitError carries the correct attempt count and last status", async () => {
    const op = vi
      .fn()
      .mockRejectedValue(new IpfsGatewayResponseError(503, null, "down"));

    let caught: IpfsRateLimitError | undefined;
    try {
      await withIpfsRetry(op, { maxAttempts: 2, delayFn: instantDelay });
    } catch (e) {
      caught = e as IpfsRateLimitError;
    }

    expect(caught).toBeInstanceOf(IpfsRateLimitError);
    expect(caught!.attempts).toBe(2);
    expect(caught!.lastStatus).toBe(503);
  });

  it("throws IpfsRateLimitError after maxAttempts on persistent network errors", async () => {
    const op = vi.fn().mockRejectedValue(new Error("fetch failed"));

    await expect(
      withIpfsRetry(op, { maxAttempts: 3, delayFn: instantDelay }),
    ).rejects.toThrow(IpfsRateLimitError);

    expect(op).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// withIpfsRetry — non-retryable errors
// ---------------------------------------------------------------------------

describe("withIpfsRetry — non-retryable errors", () => {
  it.each([400, 401, 403, 404, 500])(
    "does NOT retry on non-retryable HTTP %i",
    async (status) => {
      const op = vi
        .fn()
        .mockRejectedValue(
          new IpfsGatewayResponseError(status, null, `HTTP ${status}`),
        );

      await expect(
        withIpfsRetry(op, { maxAttempts: 4, delayFn: instantDelay }),
      ).rejects.toThrow(IpfsGatewayResponseError);

      // Only one call — should not have retried
      expect(op).toHaveBeenCalledTimes(1);
    },
  );
});

// ---------------------------------------------------------------------------
// withIpfsRetry — edge cases
// ---------------------------------------------------------------------------

describe("withIpfsRetry — edge cases", () => {
  it("maxAttempts = 1 means no retries at all", async () => {
    const op = vi
      .fn()
      .mockRejectedValue(new IpfsGatewayResponseError(429, null, "slow"));

    await expect(
      withIpfsRetry(op, { maxAttempts: 1, delayFn: instantDelay }),
    ).rejects.toThrow();

    expect(op).toHaveBeenCalledTimes(1);
  });

  it("delay is capped at maxDelayMs", async () => {
    const delays: number[] = [];
    const delayFn = (ms: number) => {
      delays.push(ms);
      return Promise.resolve();
    };

    const op = makeFlaky(
      3,
      () =>
        new IpfsGatewayResponseError(429, null, "rate limited"),
    );
    await withIpfsRetry(op, {
      maxAttempts: 5,
      baseDelayMs: 100_000, // Very large base
      maxDelayMs: 500,      // Small cap
      delayFn,
    });

    delays.forEach((d) => expect(d).toBeLessThanOrEqual(500));
  });
});
