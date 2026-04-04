import Arweave from 'arweave';

const arweave = Arweave.init({
    host: 'arweave.net',
    port: 443,
    protocol: 'https'
});

/**
 * Uploads encrypted vault data to Arweave.
 * 
 * @param encryptedData The encrypted byte array to store.
 * @returns A promise that resolves to the Arweave transaction ID.
 */
export async function uploadVaultToArweave(encryptedData: Uint8Array): Promise<string> {
    const jwkEnv = process.env.ARWEAVE_KEY;
    if (!jwkEnv) {
        throw new Error("ARWEAVE_KEY is not configured.");
    }

    let jwk: any;
    try {
        jwk = JSON.parse(jwkEnv);
    } catch {
        throw new Error("ARWEAVE_KEY is invalid JSON.");
    }

    try {
        const transaction = await arweave.createTransaction({ data: encryptedData }, jwk);
        transaction.addTag('Content-Type', 'application/octet-stream');
        transaction.addTag('App-Name', 'Tessera');

        await arweave.transactions.sign(transaction, jwk);

        const response = await arweave.transactions.post(transaction);

        if (response.status >= 400) {
            throw new Error(`Failed to upload to Arweave: HTTP ${response.status} - ${response.statusText}`);
        }

        return transaction.id;
    } catch (error: any) {
        throw new Error(`Arweave upload error: ${error.message}`);
    }
}
