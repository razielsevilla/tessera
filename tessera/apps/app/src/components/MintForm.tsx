import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js';
import { engine } from '@tessera/engine';
import idl from '../../../../packages/contracts/target/idl/tessera.json';

export default function MintForm({ onMintSuccess }: { onMintSuccess?: () => void }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey || !wallet.signMessage) {
      alert('Wallet not connected or does not support message signing');
      return;
    }

    setLoading(true);
    setStatus('Initializing engine...');
    
    try {
      await engine.init();

      setStatus('Encrypting and generating BMP...');
      // 1. Mock JSON form data
      const rawData = new TextEncoder().encode(JSON.stringify({
        moodScore: 8,
        socialBattery: 5,
        productivityScore: 85,
        frameTier: 2
      }));

      // Use a dummy key for MVP demo
      const key = new Uint8Array(32);
      key.fill(1); // placeholder

      // 2. Encrypt & Generate BMP
      const encryptedData = engine.encrypt(rawData, key);
      let dataHash;
      try {
          dataHash = engine.hashBytes(encryptedData); // [u8; 32]
      } catch(e) {
          // fallback if engine.hashBytes is unexported
          dataHash = new Uint8Array(32);
          dataHash.fill(2);
      }
      
      const signature = await wallet.signMessage(dataHash); // [u8; 64]

      setStatus('Uploading encrypted blob to IPFS (mock fallback)...');
      
      // 3. IPFS Upload
      let cid = 'QmMockCid1234567890';
      try {
        // if (typeof uploadVaultBlob === 'function') {
        //   cid = await uploadVaultBlob(encryptedData);
        // }
        // mock logic
      } catch (err) {
        console.warn('IPFS upload failed/missing, using mock CID', err);
      }

      setStatus('Preparing Solana transaction...');
      
      // 4. Contract Call
      const provider = new anchor.AnchorProvider(connection, wallet as any, {});
      const program = new anchor.Program(idl as unknown as anchor.Idl, provider);

      // Derive PDAs
      const [userProfilePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_profile'), wallet.publicKey.toBuffer()],
        program.programId
      );

      const [newTesseraPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('tessera'), wallet.publicKey.toBuffer(), Buffer.from(cid.substring(0, 8))],
        program.programId
      );

      setStatus('Sending mintTessera transaction...');
      const tx = await program.methods.mintTessera({
        authSig: Array.from(signature),
        dataHash: Array.from(dataHash),
        metadataUri: `ipfs://${cid}`
      })
      .accounts({
        userProfile: userProfilePda,
        newTessera: newTesseraPda,
        owner: wallet.publicKey,
        systemProgram: SystemProgram.programId,
        ixSysvar: SYSVAR_INSTRUCTIONS_PUBKEY
      })
      .rpc();

      setStatus(`Mint success! Tx: ${tx}`);
      if (onMintSuccess) onMintSuccess();
    } catch (err: any) {
      console.error('Minting error:', err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.connected) return null;

  return (
    <div className="w-full max-w-sm mx-auto p-4 border rounded-xl dark:border-white/[.145] bg-neutral-50 dark:bg-black">
      <h3 className="text-lg font-bold mb-4">Mint Today's Tessera</h3>
      <form onSubmit={handleMint} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm">Mood (1-10)</label>
          <input type="range" min="1" max="10" defaultValue="8" disabled={loading} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm">Productivity (1-100)</label>
          <input type="range" min="1" max="100" defaultValue="85" disabled={loading} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Mint Tile'}
        </button>
      </form>
      {status && (
        <p className="mt-4 text-xs font-mono text-gray-500 break-words">
          {status}
        </p>
      )}
    </div>
  );
}
