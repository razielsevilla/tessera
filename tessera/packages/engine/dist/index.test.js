import { describe, it, expect, beforeAll } from "vitest";
import { engine } from "./index";
describe("TesseraEngine Wrapper", () => {
    beforeAll(async () => {
        // We need to initialize the engine before running tests.
        // Note: In a Node.js environment, the web-targeted WASM might need special handling
        // or we might need to mock the fetch of the .wasm file.
        try {
            await engine.init();
        }
        catch (e) {
            console.warn("WASM initialization failed in test environment. This is expected if 'fetch' is not available or .wasm path is incorrect in Node.");
            // If it fails, we might need to skip or mock for now, but let's see.
        }
    });
    describe("Encryption Round-trip", () => {
        it("should encrypt and decrypt data correctly", () => {
            const data = new TextEncoder().encode("Hello, Tessera!");
            const key = new Uint8Array(32).fill(0x42);
            const encrypted = engine.encrypt(data, key);
            expect(encrypted).toBeDefined();
            expect(encrypted.length).toBeGreaterThan(data.length);
            const decrypted = engine.decrypt(encrypted, key);
            expect(new TextDecoder().decode(decrypted)).toBe("Hello, Tessera!");
        });
        it("should fail to decrypt with wrong key", () => {
            const data = new TextEncoder().encode("Secret");
            const key = new Uint8Array(32).fill(0x1);
            const wrongKey = new Uint8Array(32).fill(0x2);
            const encrypted = engine.encrypt(data, key);
            expect(() => engine.decrypt(encrypted, wrongKey)).toThrow();
        });
    });
    describe("Hashing", () => {
        it("should produce deterministic scores hashes", () => {
            const scores = [100n, 50n, 25n, 10n];
            const hash1 = engine.hashScores(scores);
            const hash2 = engine.hashScores(scores);
            expect(hash1).toEqual(hash2);
            expect(hash1.length).toBe(32);
        });
        it("should produce different hashes for different scores", () => {
            const hash1 = engine.hashScores([100n]);
            const hash2 = engine.hashScores([101n]);
            expect(hash1).not.toEqual(hash2);
        });
        it("should produce deterministic byte hashes", () => {
            const data = new TextEncoder().encode("tessera-data");
            const hash1 = engine.hashBytes(data);
            const hash2 = engine.hashBytes(data);
            expect(hash1).toEqual(hash2);
        });
    });
    describe("BMP Serialization", () => {
        it("should serialize BMP correctly using BmpBuilder", () => {
            const builder = engine.createBmpBuilder();
            builder.set_version(1);
            builder.set_date_epoch(12345678);
            const cid = new Uint8Array(46).fill(0x9);
            builder.set_vault_cid(cid);
            const hash = new Uint8Array(32).fill(0x7);
            builder.set_module_hash(hash);
            builder.set_visual_meta(200, 255, 128, 50, 1, 2, 0);
            const serialized = builder.serialize();
            expect(serialized).toBeDefined();
            expect(serialized.length).toBeLessThan(256);
        });
        it("should deterministically pad and serialize a string CID (Arweave/IPFS)", () => {
            const builder = engine.createBmpBuilder();
            const ipfsCid = "QmYwAPJzv5CZsnA625s3Xf2nL6bAgk9S6p6Xw6QxYQ5wA1"; // Typical 46 char IPFS v0 CID
            builder.setVaultCidString(ipfsCid);
            const arweveTx = "j_yCj4uHn488fP3D-Y94Q7vX5_tP_zYjO9rQkO4_gXo"; // Typical 43 char transaction id
            const builder2 = engine.createBmpBuilder();
            builder2.setVaultCidString(arweveTx);
            expect(builder.serialize()).toBeDefined();
            expect(builder2.serialize()).toBeDefined();
        });
    });
    describe("Key Derivation", () => {
        it("should derive keys deterministically", () => {
            const ikm = new Uint8Array(64).fill(0xAA);
            const salt = new Uint8Array(16).fill(0xBB);
            const info = "test-purpose";
            const key1 = engine.deriveKey(ikm, salt, info);
            const key2 = engine.deriveKey(ikm, salt, info);
            expect(key1).toEqual(key2);
            expect(key1.length).toBe(32);
        });
        it("should produce different keys for different info strings", () => {
            const ikm = new Uint8Array(64).fill(0xAA);
            const key1 = engine.deriveKey(ikm, null, "info-1");
            const key2 = engine.deriveKey(ikm, null, "info-2");
            expect(key1).not.toEqual(key2);
        });
    });
});
