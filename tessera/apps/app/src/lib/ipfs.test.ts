import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadVaultBlob } from './ipfs';

// Mock PinataSDK
vi.mock('pinata', () => {
  return {
    PinataSDK: vi.fn().mockImplementation(() => {
      return {
        upload: {
          file: vi.fn().mockResolvedValue({
            cid: 'QmTestHash',
          }),
        },
      };
    }),
  };
});

describe('uploadVaultBlob', () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
    });

    it('requires PINATA_JWT environment variable', async () => {
        vi.stubEnv('PINATA_JWT', '');
        
        await expect(
            uploadVaultBlob(new Uint8Array([1, 2, 3]))
        ).rejects.toThrowError('PINATA_JWT is not configured.');
    });

    it('successfully uploads and returns CID', async () => {
        vi.stubEnv('PINATA_JWT', 'fake_jwt');
        vi.stubEnv('NEXT_PUBLIC_GATEWAY_URL', 'fake_gateway');

        const data = new Uint8Array([1, 2, 3, 4, 5]);
        const cid = await uploadVaultBlob(data);

        expect(cid).toBe('QmTestHash');
    });
});