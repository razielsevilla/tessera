import { PinataSDK } from "pinata";
import {
  withIpfsRetry,
  IpfsGatewayResponseError,
  type RetryOptions,
} from "./ipfs-retry";

let pinataInstance: PinataSDK | null = null;
function getPinata() {
  if (!pinataInstance) {
    pinataInstance = new PinataSDK({
      pinataJwt: process.env.PINATA_JWT || "",
      pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL || "",
    });
  }
  return pinataInstance;
}

/**
 * Uploads encrypted vault data to IPFS using Pinata.
 *
 * Automatically retries on 429 (rate-limit) and transient 5xx gateway
 * errors using exponential back-off with full jitter. Respects the
 * `Retry-After` response header when present.
 *
 * @param encryptedData The encrypted byte array to store.
 * @param retryOptions  Optional overrides for retry behaviour (useful in tests).
 * @returns A promise that resolves to the IPFS CID string.
 */
export async function uploadVaultBlob(
  encryptedData: Uint8Array,
  retryOptions?: RetryOptions,
): Promise<string> {
  if (!process.env.PINATA_JWT) {
    throw new Error("PINATA_JWT is not configured.");
  }

  const pinata = getPinata();

  return withIpfsRetry(async () => {
    try {
      const blob = new Blob([encryptedData as unknown as BlobPart], {
        type: "application/octet-stream",
      });
      const file = new File([blob], "vault.bin", {
        type: "application/octet-stream",
      });

      const upload = await pinata.upload.public.file(file);
      return upload.cid;
    } catch (error: unknown) {
      // Pinata SDK may surface HTTP errors as generic Error objects.
      // Inspect the message for known status patterns and re-wrap so the
      // retry wrapper can make a structured decision.
      if (error instanceof Error) {
        const statusMatch = error.message.match(/\b(429|502|503|504)\b/);
        if (statusMatch) {
          throw new IpfsGatewayResponseError(
            parseInt(statusMatch[1], 10),
            null,
            error.message,
          );
        }
        // Non-retryable or unknown: surface as-is
        throw error;
      }
      throw error;
    }
  }, retryOptions);
}
