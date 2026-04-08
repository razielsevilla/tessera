import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js';
import { engine } from '@tessera/engine';
import idl from '../../../../packages/contracts/target/idl/tessera.json';
import { TaskTracker } from './TaskTracker';
import { RetrospectiveLogger, RetrospectiveData } from './RetrospectiveLogger';
import { LifeEconomyTracker } from './LifeEconomyTracker';
import { MediaLogger, MediaLogData } from './MediaLogger';
import { InteractiveFictionLogger, InteractiveFictionData } from './InteractiveFictionLogger';
import { calculateProductivityScore } from '../lib/scoring';

export default function MintForm({ onMintSuccess }: { onMintSuccess?: () => void }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [taskPoints, setTaskPoints] = useState(0);
  const [economyPoints, setEconomyPoints] = useState(0);
  const [retroData, setRetrospectiveData] = useState<RetrospectiveData>({
    milestone: '',
    notes: '',
    isSprintEnd: false
  });
  const [mediaData, setMediaData] = useState<MediaLogData>({
    title: '',
    type: 'book',
    progress: 0,
    genres: []
  });
  const [interactiveFictionData, setInteractiveFictionData] = useState<InteractiveFictionData>({
    storyTitle: '',
    currentNodeId: '',
    choicesMade: []
  });

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey || !wallet.signMessage) {
      setError('Wallet not connected or does not support message signing');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await engine.init();

      setStatus('Encrypting and generating BMP...');
      // 1. Mock JSON form data
      const rawData = new TextEncoder().encode(JSON.stringify({
        moodScore: 8,
        socialBattery: 5,
        productivityScore: calculateProductivityScore(taskPoints, economyPoints),
        economyPoints: economyPoints,
        frameTier: 2,
        retrospective: retroData,
        media: mediaData,
        interactiveFiction: interactiveFictionData
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
      }

      if (!dataHash || dataHash.length === 0) {
        dataHash = new Uint8Array(32);
        dataHash.fill(2);
      }

      // Phantom Wallet prevents apps from blindly signing raw 32-byte arrays as it suspects they
      // might be malicious Solana transactions. For MVP/Demo, we sign a human-readable encoded string.
      const messageToSign = new TextEncoder().encode(`Tessera Mint Authentication\nPayload Hash: ${Buffer.from(dataHash).toString('hex')}`);
      const signature = await wallet.signMessage(messageToSign); // [u8; 64]

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

      setStatus('');
      setSuccess(`Mint success! Tx: ${tx}`);
      if (onMintSuccess) onMintSuccess();
    } catch (err: any) {
      console.error('Minting error:', err);
      setStatus('');
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.connected) return null;

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 border rounded-xl dark:border-white/[.145] bg-neutral-50 dark:bg-black shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-center sm:text-left">Mint Today&apos;s Tessera</h3>
      <form onSubmit={handleMint} className="flex flex-col gap-4">
        
        <TaskTracker 
          disabled={loading} 
          onPointsUpdate={setTaskPoints} 
        />

        <RetrospectiveLogger 
          disabled={loading} 
          onChange={setRetrospectiveData} 
        />

        <LifeEconomyTracker
          disabled={loading}
          onPointsUpdate={setEconomyPoints}
        />

        <MediaLogger
          disabled={loading}
          onChange={setMediaData}
        />

        <InteractiveFictionLogger
          disabled={loading}
          onChange={setInteractiveFictionData}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm">Mood (1-10)</label>
          <input type="range" min="1" max="10" defaultValue="8" disabled={loading} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm">Productivity (Base + Tasks + Economy)</label>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={calculateProductivityScore(taskPoints, economyPoints)} 
            disabled 
            className="opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : 'Mint Tile'}
        </button>
      </form>

      {status && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-center animate-pulse">
          {status}
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-200 dark:border-green-800 rounded-lg text-sm text-center truncate">
          {success}
        </div>
      )}
    </div>
  );
}
