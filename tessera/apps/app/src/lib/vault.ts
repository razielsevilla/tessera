import { engine } from "@tessera/engine";

/**
 * Download and decrypt an encrypted vault blob from IPFS using the configured gateway.
 * 
 * @param cid The Content Identifier (CID) of the vault blob on IPFS.
 * @param key The 32-byte encryption key used to decrypt the vault.
 * @returns A promise that resolves to the decrypted raw data as a Uint8Array.
 */
export async function fetchAndDecryptVault(cid: string, key: Uint8Array): Promise<Uint8Array> {
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
    const encryptedData = new Uint8Array(arrayBuffer);

    // Ensure the cryptographic engine is fully initialized
    await engine.init();

    // Perform decryption
    try {
        const decrypted = engine.decrypt(encryptedData, key);
        return decrypted;
    } catch (error: any) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
}
