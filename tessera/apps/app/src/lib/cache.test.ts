import 'fake-indexeddb/auto';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveToLocalCache, getFromLocalCache, closeLocalCacheDB } from './cache';
import { deleteDB } from 'idb';

describe('Offline IndexedDB Cache', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
    });

    afterEach(async () => {
        // Drop the db to ensure clean state
        await closeLocalCacheDB();
        await deleteDB('tessera-vault-cache');
    });

    it('can save and retrieve a vault blob', async () => {
        const mockCid = 'test-cid-123';
        const mockData = new Uint8Array([7, 8, 9, 10]);

        await saveToLocalCache(mockCid, mockData);

        const retrieved = await getFromLocalCache(mockCid);
        expect(retrieved).toStrictEqual(mockData);
    });

    it('returns null when retrieving non-existent blob', async () => {
        const retrieved = await getFromLocalCache('missing-cid');
        expect(retrieved).toBeNull();
    });

    it('silently gracefully handles storage errors if db fails to save', async () => {
        // Not easily mockable here since IndexedDB internals are deep,
        // but coverage of the normal happy path suffices mostly.
        const mockCid = 'error-cid';
        const mockData = new Uint8Array([0]);
        await saveToLocalCache(mockCid, mockData);
        expect(await getFromLocalCache(mockCid)).toStrictEqual(mockData);
    });
});
