import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface VaultCacheDB extends DBSchema {
    vaults: {
        key: string;
        value: {
            cid: string;
            encryptedData: Uint8Array;
            timestamp: number;
        };
    };
}

const DB_NAME = 'tessera-vault-cache';
const STORE_NAME = 'vaults';

let dbPromise: Promise<IDBPDatabase<VaultCacheDB>> | null = null;

/**
 * Initializes the IndexedDB database, returning a promise to the db connection.
 */
function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<VaultCacheDB>(DB_NAME, 1, {
            upgrade(db) {
                db.createObjectStore(STORE_NAME, { keyPath: 'cid' });
            },
        }).catch(err => {
            // Reset promise on error so we can try again
            dbPromise = null;
            throw err;
        });
    }
    return dbPromise;
}

/**
 * Saves the encrypted vault data into the local IndexedDB cache.
 * 
 * @param cid The IPFS Content Identifier
 * @param encryptedData The raw encrypted blob to store
 */
export async function saveToLocalCache(cid: string, encryptedData: Uint8Array): Promise<void> {
    try {
        const db = await getDB();
        await db.put(STORE_NAME, {
            cid,
            encryptedData,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Failed to save vault to local cache:', error);
    }
}

/**
 * Retrieves the encrypted vault data from the local IndexedDB cache.
 * 
 * @param cid The IPFS Content Identifier
 * @returns The encrypted data if found, or null if missing.
 */
export async function getFromLocalCache(cid: string): Promise<Uint8Array | null> {
    try {
        const db = await getDB();
        const record = await db.get(STORE_NAME, cid);
        return record ? record.encryptedData : null;
    } catch (error) {
        console.error('Failed to get vault from local cache:', error);
        return null;
    }
}

/**
 * Close the database connection. Useful for cleanup during tests.
 */
export async function closeLocalCacheDB(): Promise<void> {
    if (dbPromise) {
        const db = await dbPromise;
        db.close();
        dbPromise = null;
    }
}
