import { BmpBuilder } from "@tessera/engine-core";
/**
 * High-level TypeScript wrapper for the Tessera WASM encryption engine.
 * This class handles initialization and provides a clean API for cryptographic operations.
 */
export declare class TesseraEngine {
    private static instance;
    private initialized;
    private constructor();
    /**
     * Singleton pattern to ensure the engine is initialized only once.
     */
    static getInstance(): TesseraEngine;
    /**
     * Initializes the WASM module. This must be called before any other methods.
     * In a browser environment, this fetches and compiles the WASM binary.
     */
    init(): Promise<void>;
    /**
     * Ensures the engine is initialized before use.
     */
    private ensureInitialized;
    /**
     * Encrypts a data blob using AES-256-GCM.
     * @param data The raw data to encrypt as Uint8Array
     * @param key The 32-byte encryption key
     * @returns Encrypted data with nonce prepended
     */
    encrypt(data: Uint8Array, key: Uint8Array): Uint8Array;
    /**
     * Decrypts a data blob using AES-256-GCM.
     * @param encryptedData The encrypted data (nonce + ciphertext)
     * @param key The 32-byte encryption key
     * @returns The decrypted raw data
     */
    decrypt(encryptedData: Uint8Array, key: Uint8Array): Uint8Array;
    /**
     * Computes a Poseidon hash of an array of module scores.
     * @param scores Array of numeric scores (u64 values)
     * @returns 32-byte hash commitment
     */
    hashScores(scores: BigUint64Array | bigint[]): Uint8Array;
    /**
     * Computes a Poseidon hash of arbitrary bytes.
     * @param data Input data
     * @returns 32-byte hash commitment
     */
    hashBytes(data: Uint8Array): Uint8Array;
    /**
     * Derives a 32-byte key from input keying material (e.g. wallet signature) using HKDF-SHA256.
     * @param ikm Input keying material
     * @param salt Optional salt
     * @param info Application-specific info string (e.g. "tessera-vault-key")
     * @returns 32-byte derived key
     */
    deriveKey(ikm: Uint8Array, salt: Uint8Array | null, info: string): Uint8Array;
    /**
     * Creates a new BmpBuilder for assembling Bundled Metadata Payloads.
     */
    createBmpBuilder(): BmpBuilder;
    /**
     * Generates a ZK proof for a threshold value.
     */
    generateThresholdProof(value: number, threshold: number, provingKey: Uint8Array): any;
}
export declare const engine: TesseraEngine;
export type { BmpBuilder };
