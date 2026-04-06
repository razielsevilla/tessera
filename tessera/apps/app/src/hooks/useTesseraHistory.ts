import { useEffect, useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { BMPMetadata } from '../components/TesseraCell';
// Load compiled IDL mapping directly from Phase 3 
import idl from '../../../../packages/contracts/target/idl/tessera.json';

export interface TesseraSlot {
  id: number;
  isFilled: boolean;
  metadata?: BMPMetadata;
}

export function useTesseraHistory() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [slots, setSlots] = useState<TesseraSlot[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const program = useMemo(() => {
    if (!wallet.publicKey) return null;
    const provider = new anchor.AnchorProvider(connection, wallet as any, {});  
    return new anchor.Program(idl as unknown as anchor.Idl, provider);
  }, [connection, wallet]);

  useEffect(() => {
    if (!program || !wallet.publicKey) {
      setSlots(undefined);
      setError(null);
      return;
    }

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        // Query the program for TesseraAccount structs belonging to this wallet.
        // Using memcmp offset 8 bytes to skip discriminator and match wallet_owner.
        const accounts = await (program!.account as any)['TesseraAccount'].all([
          {
            memcmp: {
              offset: 8,
              bytes: wallet.publicKey!.toBase58()
            }
          }
        ]);

        // Default populate a 365 grid of empty cells
        const newSlots = Array.from({ length: 365 }).map((_, i) => ({
          id: i,
          isFilled: false,
        })) as TesseraSlot[];

        // Fill slots based on on-chain data
        accounts.forEach((acc: any) => {
          const onChainData = acc.account as any;
          // Real MVP: Using modulo to map timestamps safely to a 365 array index.
          // Eventually, specific date-math would handle exact tile projection.
          const slotId = (Number(onChainData.mintingTimestamp || 0) % 365);
          
          newSlots[slotId] = {
            id: slotId,
            isFilled: true,
            metadata: {
              moodScore: Math.floor(Math.random() * 10) + 1, // Mock decrypted value
              socialBattery: Math.floor(Math.random() * 10) + 1,
              productivityScore: Math.floor(Math.random() * 100) + 1,
              frameTier: Math.floor(Math.random() * 5),
            }
          };
        });

        setSlots(newSlots);
      } catch (err: any) {
        console.error('Failed to fetch Tessera history:', err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [program, wallet.publicKey]);

  return { slots, loading, error };
}
