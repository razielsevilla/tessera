'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen flex flex-col p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="flex justify-between items-center w-full max-w-5xl mx-auto border-b pb-4 dark:border-white/[.145]">
        <h1 className="text-2xl font-bold">Tessera Dashboard</h1>
        <WalletMultiButtonDynamic />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-8 mt-10">
        <h2 className="text-xl">
          {connected ? 'Wallet is Connected. Ready to mint.' : 'Please connect your Phantom wallet.'}
        </h2>
      </main>
    </div>
  );
}
