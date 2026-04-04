import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadVaultBlob } from './ipfs';
import { fetchAndDecryptVault } from './vault';
import { engine } from '@tessera/engine';
import 'fake-indexeddb/auto';
import { deleteDB } from 'idb';

// We store our mocked "network" in this object: Map<CID, ArrayBuffer>
const mockStorage = new Map<string, ArrayBuffer>();

// Mock Pinata instance logic so uploadVaultBlob actually populates mockStorage
vi.mock('pinata', () => {
  return {
    PinataSDK: vi.fn().mockImplementation(() => {
      return {
        upload: {
          public: {
            file: vi.fn().mockImplementation(async (file: File) => {
              // Convert the File back into an ArrayBuffer for our mock storage
              const buffer = await file.arrayBuffer();
              const fakeCid = `QmIntegrationTestHash_${Date.now()}`;
              mockStorage.set(fakeCid, buffer);
              
              return { cid: fakeCid };
            }),
          },
        },
      };
    }),
  };
});

// Mock the tessera engine module to avoid Node.js native fetch file:// issues with WebAssembly
vi.mock('@tessera/engine', () => {
    return {
        engine: {
            init: vi.fn().mockResolvedValue(undefined),
            // Mock encrypt by reversing the array
            encrypt: vi.fn((data: Uint8Array, key: Uint8Array) => {
                const out = new Uint8Array(data.length);
                for (let i = 0; i < data.length; i++) {
                    out[i] = data[data.length - 1 - i];
                }
                return out;
            }),
            // Mock decrypt by reversing it back
            decrypt: vi.fn((data: Uint8Array, key: Uint8Array) => {
                const out = new Uint8Array(data.length);
                for (let i = 0; i < data.length; i++) {
                    out[i] = data[data.length - 1 - i];
                }
                return out;
            })
        }
    };
});

describe('Vault Integration: Upload -> Fetch -> Decrypt', () => {
    let fetchSpy: any;

    beforeEach(async () => {
        vi.unstubAllEnvs();
        vi.clearAllMocks();
        mockStorage.clear(); // Reset network memory
        await deleteDB('tessera-vault-cache'); // Reset IndexedDB
        
        // Stub necessary environment parameters
        vi.stubEnv('PINATA_JWT', 'integration_fake_jwt');
        vi.stubEnv('NEXT_PUBLIC_GATEWAY_URL', 'https://mock.gateway/');
    });

    afterEach(() => {
        if (fetchSpy) {
            fetchSpy.mockRestore();
        }
    });

    it('encrypts data, uploads to mock network, fetches via CID, decrypts, and matches original data', async () => {
        // Intercept all fetch calls for the Gateway responses layer
        fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any, init?: any) => {
            const urlString = typeof input === 'string' ? input : (input && input.url ? input.url : input.toString());
            
            // 1. IPFS Gateway logic
            const cidMatch = urlString.match(/\/ipfs\/(.+)$/);
            if (cidMatch) {
                const cid = cidMatch[1];
                if (mockStorage.has(cid)) {
                    return {
                        ok: true,
                        arrayBuffer: async () => mockStorage.get(cid),
                    } as any;
                } else {
                    return { ok: false, status: 404 } as any;
                }
            }

            return { ok: false, status: 404 } as any;
        });

        // Initialize mocked engine
        await engine.init();

        // 1. Prepare raw original data and a valid 32-byte key
        const originalData = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90]);
        const key = new Uint8Array(32).fill(42); 

        // 2. Encrypt using the simulated engine module
        const encryptedBlob = engine.encrypt(originalData, key);

        // Make sure encryption actually modified the data
        expect(encryptedBlob).not.toStrictEqual(originalData);

        // 3. Upload the encrypted blob via Pinata (Mocked to network storage)
        const cid = await uploadVaultBlob(encryptedBlob);
        expect(cid).toContain('QmIntegrationTestHash_');
        
        // Ensure it went to our mock storage
        expect(mockStorage.has(cid)).toBe(true);

        // 4. Fetch CID and decrypt using vault logic
        // This will grab it mathematically via the `mockStorage` simulated gateway response
        const decryptedData = await fetchAndDecryptVault(cid, key);

        // 5. Asserts the decrypted output equals original raw data exactly
        expect(decryptedData).toStrictEqual(originalData);
    });
});
