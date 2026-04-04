import { engine } from "@tessera/engine";
import { saveToLocalCache, getFromLocalCache } from "./cache";

/**
 * Download and decrypt an encrypted vault blob from IPFS using the configured gateway.
 * Falls back to an offline local IndexedDB cache if IPFS is unreachable.
 *
 * @param cid The Content Identifier (CID) of the vault blob on IPFS.
 * @param key The 32-byte encryption key used to decrypt the vault.
 * @returns A promise that resolves to the decrypted raw data as a Uint8Array.  
 */
export async function fetchAndDecryptVault(cid: string, key: Uint8Array): Promise<Uint8Array> {
    // Ensure the cryptographic engine is fully initialized
    await engine.init();

    let encryptedData: Uint8Array;

    try {
        // Determine the IPFS gateway to use
        // Ensure we don't end up with sequential slashes by stripping trailing slash
        const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL?.replace(/\/$/, '') || "https://gateway.pinata.cloud";
        const url = `${gatewayUrl}/ipfs/${cid}`;

        // Fetch the encrypted blob
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch vault blob from IPFS: HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        encryptedData = new Uint8Array(arrayBuffer);

        // Cache the successful download for offline use
        await saveToLocalCache(cid, encryptedData);
    } catch (networkError: any) {
        // If network fetch fails, attempt to read from the local IndexedDB cache
        const cachedData = await getFromLocalCache(cid);
        if (cachedData) {
            console.warn(`IPFS fetch failed, using offline fallback cache for CID: ${cid}. Error: ${networkError.message}`);
            encryptedData = cachedData;
        } else {
            // Re-throw if nothing is in the cache
            throw new Error(`Failed to fetch vault blob from IPFS and no local cache available. Original error: ${networkError.message}`);
        }
    }
    // Perform decryption
    try {
        const decrypted = engine.decrypt(encryptedData, key);
        return decrypted;
    } catch (error: any) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}
