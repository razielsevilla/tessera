import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from '@solana/web3.js';
import { engine } from '@tessera/engine';
import { BundledMetadataPayloadSchema } from '@tessera/types';
import idl from '../../../../packages/contracts/target/idl/tessera.json';
import { TaskTracker } from './TaskTracker';
import { RetrospectiveLogger, RetrospectiveData } from './RetrospectiveLogger';
import { LifeEconomyTracker } from './LifeEconomyTracker';
import { MediaLogger, MediaLogData } from './MediaLogger';
import { InteractiveFictionLogger, InteractiveFictionData } from './InteractiveFictionLogger';
import { SocialBatteryLogger, SocialBatteryData } from './SocialBatteryLogger';
import { SkillLogger, SkillLog } from './SkillLogger';
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
    genres: [],
    pacing: 'medium',
    tropes: [],
    sessionDurationMinutes: 0
  });
  const [interactiveFictionData, setInteractiveFictionData] = useState<InteractiveFictionData>({
    storyTitle: '',
    currentNodeId: '',
    choicesMade: []
  });
  const [socialData, setSocialData] = useState<SocialBatteryData>({
    moodScore: 8,
    moodDelta: 0,
    meetings: 0,
    calls: 0,
    managedTeams: 0,
    events: []
  });
  const [skillsData, setSkillsData] = useState<SkillLog[]>([]);

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
      const payload = {
        moodScore: socialData.moodScore,
        socialBattery: 5,
        socialEngagements: {
          moodDelta: socialData.moodDelta,
          meetings: socialData.meetings,
          calls: socialData.calls,
          managedTeams: socialData.managedTeams,
          events: socialData.events
        },
        productivityScore: calculateProductivityScore(taskPoints, economyPoints),
        economyPoints: economyPoints,
        frameTier: 2,
        retrospective: retroData,
        media: mediaData,
        interactiveFiction: interactiveFictionData,
        skillsPracticed: skillsData
      };

      try {
        BundledMetadataPayloadSchema.parse(payload);
      } catch (validationError: any) {
        console.error('Validation failed:', validationError);
        setError(`Validation error: ${validationError.message || 'Invalid form data. Please check your tracking modules.'}`);
        setLoading(false);
        return;
      }

      const rawData = new TextEncoder().encode(JSON.stringify(payload));

      setStatus('Requesting vault key signature...');
      // 2. Derive deterministic vault encryption key from a wallet signature
      const authMessage = new TextEncoder().encode('Sign to derive your Tessera encryption vault key.');
      const ikmSignature = await wallet.signMessage(authMessage);
      const salt = new Uint8Array(16); // zero salt for simple deterministic MVP
      const key = engine.deriveKey(new Uint8Array(ikmSignature), salt, 'tessera-vault-key');

      // 3. Encrypt & Generate BMP
      const encryptedData = engine.encrypt(rawData, key);
      
      // Calculate Module Scores Array for Poseidon ZK-hash
      const totalSkillHours = Math.floor(skillsData.reduce((acc, s) => acc + s.hoursSpent, 0));
      const moduleScores = [
        BigInt(taskPoints),
        BigInt(economyPoints),
        BigInt(socialData.moodScore),
        BigInt(Math.floor(mediaData.progress)),
        BigInt(totalSkillHours)
      ];

      let dataHash;
      try {
          dataHash = engine.hashScores(moduleScores); // [u8; 32]
      } catch(e) {
          console.warn('hashScores failed, falling back to hashBytes:', e);
          dataHash = engine.hashBytes(encryptedData);
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

      // 4. IPFS Upload
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

      // 5. Contract Call
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
    <div className="w-full">
      <div className="flex flex-col items-center mb-8 border-b border-stone-200 dark:border-stone-800 pb-4">
        <h3 className="text-2xl sm:text-3xl font-serif text-stone-800 dark:text-stone-200">Seal Today&apos;s Entry</h3>
        <p className="text-sm font-serif italic text-stone-500 mt-2">Reflect on your tasks, moods, and stories.</p>
      </div>

      <form onSubmit={handleMint} className="flex flex-col gap-8 font-serif">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-8">
            <TaskTracker 
              disabled={loading} 
              onPointsUpdate={setTaskPoints} 
            />
            <LifeEconomyTracker
              disabled={loading}
              onPointsUpdate={setEconomyPoints}
            />
            <RetrospectiveLogger 
              disabled={loading} 
              onChange={setRetrospectiveData} 
            />
          </div>

          <div className="flex flex-col gap-8">
            <SocialBatteryLogger
              disabled={loading}
              onChange={setSocialData}
            />
            <MediaLogger
              disabled={loading}
              onChange={setMediaData}
            />
            <InteractiveFictionLogger
              disabled={loading}
              onChange={setInteractiveFictionData}
            />
          </div>
        </div>

        <div className="w-full">
          <SkillLogger
            disabled={loading}
            onChange={setSkillsData}
            accumulatedHistory={{
              'rust': 42.5,
              'typescript': 120,
              'solana': 14
            }}
          />
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
          <label className="text-sm italic text-stone-500">Overall Productivity (Auto-Calculated)</label>
          <input 
            type="range" 
            min="1" 
            max="100" 
            value={calculateProductivityScore(taskPoints, economyPoints)} 
            disabled 
            className="opacity-50 accent-stone-700"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 mt-4 bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-900 font-serif font-medium rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-50 transition-colors flex justify-center items-center gap-3 text-lg tracking-wide shadow-md"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="italic">Sealing Entry...</span>
            </>
          ) : 'Seal Entry'}
        </button>
      </form>

      {status && (
        <div className="mt-6 p-4 bg-stone-100 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 rounded-lg text-sm text-center animate-pulse font-serif italic">
          {status}
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 border border-rose-200 dark:border-rose-900 rounded-lg text-sm font-serif">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-lg text-sm text-center font-serif italic">
          {success}
        </div>
      )}
    </div>
  );
}
