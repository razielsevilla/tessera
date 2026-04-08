import { engine } from "@tessera/engine";
import { saveToLocalCache, getFromLocalCache } from "./cache";
import {
  withIpfsRetry,
  IpfsGatewayResponseError,
  IpfsRateLimitError,
  type RetryOptions,
} from "./ipfs-retry";

/**
 * Download and decrypt an encrypted vault blob from IPFS using the configured gateway.
 *
 * - Automatically retries 429/5xx gateway responses with exponential back-off
 *   and full jitter before falling back to the offline IndexedDB cache.
 * - Falls back to the offline local IndexedDB cache if all retries are exhausted
 *   or a network-level failure occurs.
 *
 * @param cid           The Content Identifier (CID) of the vault blob on IPFS.
 * @param key           The 32-byte encryption key used to decrypt the vault.
 * @param retryOptions  Optional overrides for retry behaviour (useful in tests).
 * @returns A promise that resolves to the decrypted raw data as a Uint8Array.
 */
export async function fetchAndDecryptVault(
  cid: string,
  key: Uint8Array,
  retryOptions?: RetryOptions,
): Promise<Uint8Array> {
  // Ensure the cryptographic engine is fully initialized
  await engine.init();

  let encryptedData: Uint8Array;

  try {
    // Strip trailing slash to avoid double-slash in URL construction
    let gatewayUrl =
      process.env.NEXT_PUBLIC_GATEWAY_URL?.replace(/\/$/, "") ||
      "https://gateway.pinata.cloud";
      
    // Enforce TLS/HTTPS on the gateway URL
    if (gatewayUrl.startsWith("http://") && !gatewayUrl.includes("localhost") && !gatewayUrl.includes("127.0.0.1")) {
      gatewayUrl = gatewayUrl.replace("http://", "https://");
    }
      
    const url = `${gatewayUrl}/ipfs/${cid}`;

    // Fetch with automatic rate-limit retry
    encryptedData = await withIpfsRetry(async () => {
      const response = await fetch(url);

      if (!response.ok) {
        // Propagate rate-limit / gateway errors as structured exceptions
        const retryAfterHeader = response.headers?.get("Retry-After") ?? null;
        throw new IpfsGatewayResponseError(
          response.status,
          retryAfterHeader,
          `Failed to fetch vault blob from IPFS: HTTP ${response.status}`,
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }, retryOptions);

    // Cache the successful download for offline use
    await saveToLocalCache(cid, encryptedData);
  } catch (networkError: unknown) {
    // If all retries failed (network or rate-limit exhaustion), attempt the
    // local IndexedDB cache as an offline fallback.
    const cachedData = await getFromLocalCache(cid);
    if (cachedData) {
      // Prefer the root-cause message over the retry-exhaustion wrapper message
      const errorMessage = (() => {
        if (networkError instanceof IpfsRateLimitError && networkError.cause) {
          return networkError.cause.message;
        }
        return networkError instanceof Error
          ? networkError.message
          : String(networkError);
      })();
      console.warn(
        `IPFS fetch failed, using offline fallback cache for CID: ${cid}. Error: ${errorMessage}`,
      );
      encryptedData = cachedData;
    } else {
      const originalMessage = (() => {
        if (networkError instanceof IpfsRateLimitError && networkError.cause) {
          return networkError.cause.message;
        }
        return networkError instanceof Error
          ? networkError.message
          : String(networkError);
      })();
      throw new Error(
        `Failed to fetch vault blob from IPFS and no local cache available. Original error: ${originalMessage}`,
      );
    }
  }

  // Perform decryption
  try {
    const decrypted = engine.decrypt(encryptedData, key);
    return decrypted;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Decryption failed: ${message}`);
  }
}
