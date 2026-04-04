import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadVaultToArweave } from './arweave';

vi.mock('arweave', () => {
  return {
    default: {
      init: vi.fn().mockReturnValue({
        createTransaction: vi.fn().mockResolvedValue({
          id: 'MockTransactionId',
          addTag: vi.fn(),
        }),
        transactions: {
          sign: vi.fn().mockResolvedValue(true),
          post: vi.fn().mockResolvedValue({
            status: 200,
            statusText: 'OK',
          }),
        },
      }),
    },
  };
});

describe('uploadVaultToArweave', () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
    });

    it('requires ARWEAVE_KEY environment variable', async () => {
        vi.stubEnv('ARWEAVE_KEY', '');
        
        await expect(
            uploadVaultToArweave(new Uint8Array([1, 2, 3]))
        ).rejects.toThrowError('ARWEAVE_KEY is not configured.');
    });

    it('requires ARWEAVE_KEY to be valid JSON', async () => {
        vi.stubEnv('ARWEAVE_KEY', 'invalid-json');
        
        await expect(
            uploadVaultToArweave(new Uint8Array([1, 2, 3]))
        ).rejects.toThrowError('ARWEAVE_KEY is invalid JSON.');
    });

    it('successfully creates, signs, and posts transaction', async () => {
        vi.stubEnv('ARWEAVE_KEY', JSON.stringify({ kty: 'RSA', n: 'mock', e: 'mock' }));

        const data = new Uint8Array([1, 2, 3, 4, 5]);
        const txId = await uploadVaultToArweave(data);

        expect(txId).toBe('MockTransactionId');
    });
});
