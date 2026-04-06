'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { MosaicCanvas } from '../components/MosaicCanvas';
import MintForm from '../components/MintForm';
import { useTesseraHistory } from '../hooks/useTesseraHistory';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const { connected } = useWallet();
  const { slots, loading, error } = useTesseraHistory();

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="flex flex-col sm:flex-row justify-between items-center w-full max-w-5xl mx-auto border-b pb-4 gap-4 sm:gap-0 dark:border-white/[.145]">
        <h1 className="text-2xl font-bold text-center sm:text-left">Tessera Dashboard</h1>
        <WalletMultiButtonDynamic />
      </header>

      <main className="flex-1 flex flex-col items-center justify-start gap-8 mt-6 sm:mt-10 w-full max-w-5xl mx-auto">
        <h2 className="text-lg sm:text-xl text-center">
          {connected ? 'Wallet is Connected. Ready to mint.' : 'Please connect your Phantom wallet.'}
        </h2>

        {connected && (
          <section className="w-full max-w-4xl flex justify-center">
            <MintForm onMintSuccess={() => window.location.reload()} />
          </section>
        )}

        {loading && <p className="text-sm text-gray-500 animate-pulse bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">Loading on-chain tessera history...</p>}
        
        {error && (
          <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 rounded-lg flex items-center justify-between w-full max-w-md mx-4 sm:mx-0 text-center sm:text-left">
            <span>Failed to load history: {error}</span>
          </div>
        )}

        <section className="w-full max-w-4xl flex justify-center overflow-auto border rounded-xl p-4 sm:p-6 dark:border-white/[.145] relative">
          <MosaicCanvas slots={slots} />
        </section>
      </main>
    </div>
  );
}
