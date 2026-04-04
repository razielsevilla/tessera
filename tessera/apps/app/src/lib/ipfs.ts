import { PinataSDK } from "pinata";

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
 * @param encryptedData The encrypted byte array to store.
 * @returns A promise that resolves to the IPFS CID string.
 */
export async function uploadVaultBlob(encryptedData: Uint8Array): Promise<string> {
    if (!process.env.PINATA_JWT) {
        throw new Error("PINATA_JWT is not configured.");
    }
    try {
        const pinata = getPinata();
        // Convert Uint8Array to File
        const blob = new Blob([encryptedData as unknown as BlobPart], { type: 'application/octet-stream' });
        const file = new File([blob], 'vault.bin', { type: 'application/octet-stream' });

        const upload = await pinata.upload.public.file(file);
        return upload.cid;
    } catch (error: any) {
        throw new Error(`Failed to upload to IPFS via Pinata: ${error.message}`);
    }
}

