import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAndDecryptVault } from './vault';
import { engine } from '@tessera/engine';
import { saveToLocalCache, getFromLocalCache } from './cache';

// Keep track of our global fetch spy
const fetchSpy = vi.fn();
vi.stubGlobal('fetch', fetchSpy);

// Mock the cache module
vi.mock('./cache', () => {
    return {
        saveToLocalCache: vi.fn(),
        getFromLocalCache: vi.fn()
    };
});

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

it('successfully fetches and decrypts data and saves to cache', async () => {
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
        expect(saveToLocalCache).toHaveBeenCalledWith('mock-cid', new Uint8Array([0, 0, 0])); // mockBuffer will be coerced into an empty layout
        // Uses the returning buffer properly
        expect(result).toStrictEqual(new Uint8Array([1, 2, 3]));
    });

    it('falls back to local cache on network failure and handles decrypt', async () => {
        fetchSpy.mockRejectedValue(new Error('Network error'));
        vi.mocked(getFromLocalCache).mockResolvedValue(new Uint8Array([9, 9])); 

        const key = new Uint8Array([1]);
        const result = await fetchAndDecryptVault('mock-cid', key);

        expect(getFromLocalCache).toHaveBeenCalledWith('mock-cid');
        expect(engine.decrypt).toHaveBeenCalledWith(new Uint8Array([9, 9]), key);
        expect(result).toStrictEqual(new Uint8Array([1, 2, 3]));
    });

    it('throws combined error if network fails and cache is empty', async () => {
        fetchSpy.mockRejectedValue(new Error('Network error'));
        vi.mocked(getFromLocalCache).mockResolvedValue(null); 

        const key = new Uint8Array([1]);

        await expect(fetchAndDecryptVault('mock-cid', key))
            .rejects.toThrowError('Failed to fetch vault blob from IPFS and no local cache available. Original error: Network error');
    });

    it('handles explicit fetch failure (HTTP 404) properly without cache', async () => {
        // Assume default gateway logic in `vault.ts` kicks in
        fetchSpy.mockResolvedValue({
            ok: false,
            status: 404
        });
        vi.mocked(getFromLocalCache).mockResolvedValue(null); 

        const key = new Uint8Array([1]);

        await expect(fetchAndDecryptVault('non-existent-cid', key))
            .rejects.toThrowError('Failed to fetch vault blob from IPFS and no local cache available. Original error: Failed to fetch vault blob from IPFS: HTTP 404');
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
