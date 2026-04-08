import initWasm, { init_panic_hook, encryptBlob, decryptBlob, hashModuleScores, hashBytes, deriveVaultKey, BmpBuilder, generate_threshold_proof, } from "@tessera/engine-core";
/**
 * High-level TypeScript wrapper for the Tessera WASM encryption engine.
 * This class handles initialization and provides a clean API for cryptographic operations.
 */
export class TesseraEngine {
    static instance;
    initialized = false;
    constructor() { }
    /**
     * Singleton pattern to ensure the engine is initialized only once.
     */
    static getInstance() {
        if (!TesseraEngine.instance) {
            TesseraEngine.instance = new TesseraEngine();
        }
        return TesseraEngine.instance;
    }
    /**
     * Initializes the WASM module. This must be called before any other methods.
     * In a browser environment, this fetches and compiles the WASM binary.
     */
    async init() {
        if (this.initialized)
            return;
        try {
            await initWasm();
            init_panic_hook();
            this.initialized = true;
        }
        catch (error) {
            console.error("Failed to initialize Tessera Engine WASM:", error);
            throw error;
        }
    }
    /**
     * Ensures the engine is initialized before use.
     */
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error("TesseraEngine not initialized. Call init() first.");
        }
    }
    /**
     * Encrypts a data blob using AES-256-GCM.
     * @param data The raw data to encrypt as Uint8Array
     * @param key The 32-byte encryption key
     * @returns Encrypted data with nonce prepended
     */
    encrypt(data, key) {
        this.ensureInitialized();
        return encryptBlob(data, key);
    }
    /**
     * Decrypts a data blob using AES-256-GCM.
     * @param encryptedData The encrypted data (nonce + ciphertext)
     * @param key The 32-byte encryption key
     * @returns The decrypted raw data
     */
    decrypt(encryptedData, key) {
        this.ensureInitialized();
        return decryptBlob(encryptedData, key);
    }
    /**
     * Computes a Poseidon hash of an array of module scores.
     * @param scores Array of numeric scores (u64 values)
     * @returns 32-byte hash commitment
     */
    hashScores(scores) {
        this.ensureInitialized();
        // wasm_bindgen handles conversion of BigUint64Array to Rust slice of u64
        const scoresArray = scores instanceof BigUint64Array ? scores : BigUint64Array.from(scores);
        return hashModuleScores(scoresArray);
    }
    /**
     * Computes a Poseidon hash of arbitrary bytes.
     * @param data Input data
     * @returns 32-byte hash commitment
     */
    hashBytes(data) {
        this.ensureInitialized();
        return hashBytes(data);
    }
    /**
     * Derives a 32-byte key from input keying material (e.g. wallet signature) using HKDF-SHA256.
     * @param ikm Input keying material
     * @param salt Optional salt
     * @param info Application-specific info string (e.g. "tessera-vault-key")
     * @returns 32-byte derived key
     */
    deriveKey(ikm, salt, info) {
        this.ensureInitialized();
        const infoBytes = new TextEncoder().encode(info);
        return deriveVaultKey(ikm, salt || undefined, infoBytes);
    }
    /**
     * Creates a new BmpBuilder for assembling Bundled Metadata Payloads.
     */
    createBmpBuilder() {
        this.ensureInitialized();
        return new BmpBuilder();
    }
    /**
     * Generates a ZK proof for a threshold value.
     */
    generateThresholdProof(value, threshold, provingKey) {
        this.ensureInitialized();
        return generate_threshold_proof(value, threshold, provingKey);
    }
}
// Export a default instance for convenience
export const engine = TesseraEngine.getInstance();
