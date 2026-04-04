import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAndDecryptVault } from './vault';
import { engine } from '@tessera/engine';

// Keep track of our global fetch spy
const fetchSpy = vi.fn();
vi.stubGlobal('fetch', fetchSpy);

// Mock the tessera engine module
vi.mock('@tessera/engine', () => {
    return {
        // Export the mocked engine
        engine: {
            init: vi.fn(),
            decrypt: vi.fn((data: Uint8Array, key: Uint8Array) => {
                if (key[0] === 0) {
                    throw new Error("Invalid Auth Tag/Key");
                }
                return new Uint8Array([1, 2, 3]);
            })
        }
    };
});

describe('fetchAndDecryptVault', () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
        vi.clearAllMocks();
    });

    it('successfully fetches and decrypts data', async () => {
        // Stub gateway URL
        vi.stubEnv('NEXT_PUBLIC_GATEWAY_URL', 'https://mock.gateway/');

        const mockBuffer = new ArrayBuffer(3);
        fetchSpy.mockResolvedValue({
            ok: true,
            arrayBuffer: vi.fn().mockResolvedValue(mockBuffer)
        });

        // Valid key
        const key = new Uint8Array([1]); 
        const result = await fetchAndDecryptVault('mock-cid', key);

        // Verification
        expect(fetchSpy).toHaveBeenCalledWith('https://mock.gateway/ipfs/mock-cid');
        expect(engine.init).toHaveBeenCalled();
        expect(engine.decrypt).toHaveBeenCalled();
        // Uses the returning buffer properly 
        expect(result).toStrictEqual(new Uint8Array([1, 2, 3]));
    });

    it('handles explicit fetch failure properly', async () => {
        // Assume default gateway logic in `vault.ts` kicks in
        fetchSpy.mockResolvedValue({
            ok: false,
            status: 404
        });

        const key = new Uint8Array([1]);
        
        await expect(fetchAndDecryptVault('non-existent-cid', key))
            .rejects.toThrowError('Failed to fetch vault blob from IPFS: HTTP 404');
        
        expect(fetchSpy).toHaveBeenCalledWith('https://gateway.pinata.cloud/ipfs/non-existent-cid');
    });

    it('throws custom error on decryption failure', async () => {
        const mockBuffer = new ArrayBuffer(3);
        fetchSpy.mockResolvedValue({
            ok: true,
            arrayBuffer: vi.fn().mockResolvedValue(mockBuffer)
        });

        // 0 key triggers the mock failure internally
        const badKey = new Uint8Array([0]); 
        
        await expect(fetchAndDecryptVault('mock-cid', badKey))
            .rejects.toThrowError('Decryption failed: Invalid Auth Tag/Key');
    });
});
