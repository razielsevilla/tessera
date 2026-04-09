'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTesseraHistory } from '../hooks/useTesseraHistory';

const MosaicCanvas = dynamic(
  async () => (await import('../components/MosaicCanvas')).MosaicCanvas,
  { ssr: false }
);

const MintForm = dynamic(
  async () => await import('../components/MintForm'),
  { ssr: false }
);

const ShareAchievement = dynamic(
  async () => (await import('../components/ShareAchievement')).ShareAchievement,
  { ssr: false }
);

import { LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ThreeDiaryCover } from '../components/ThreeDiaryCover';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Home() {
  const { connected, connecting } = useWallet();
  const { slots, loading, error } = useTesseraHistory();
  const [mounted, setMounted] = useState(false);
  const [showDiarySpread, setShowDiarySpread] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // When disconnected, reset the view
  useEffect(() => {
    if (!connected) {
      setShowDiarySpread(false);
    }
  }, [connected]);

  // Prevent flash of unauthenticated UI while checking connection or mounting
  if (!mounted || connecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-16 h-16 border-4 border-stone-200 dark:border-stone-800 border-t-stone-600 dark:border-t-stone-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-8 font-[family-name:var(--font-geist-sans)] bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-300">
      <header className="flex flex-col sm:flex-row justify-between items-center w-full max-w-7xl mx-auto border-b border-stone-200 dark:border-stone-800 pb-6 gap-4 sm:gap-0">
        <div className="flex flex-col items-center sm:items-start tracking-tight">
          <h1 className="text-3xl font-serif text-stone-900 dark:text-stone-100">My Journal</h1>
          <p className="text-sm text-stone-500 italic mt-1">Chronicle your journey, one tessera at a time.</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {connected && <WalletMultiButtonDynamic />}
        </div>
      </header>

      {!showDiarySpread ? (
        <main className="flex-1 flex items-center justify-center w-full mt-4 sm:-mt-12 relative overflow-hidden">
          {/* Interactive R3F 3D Diary Cover */}
          <ThreeDiaryCover isUnlocked={connected} onUnlockComplete={() => setShowDiarySpread(true)} />

          {/* Central Unlock Interface Overlay */}
          <div className={`relative z-10 flex flex-col items-center justify-center p-8 bg-stone-100/90 dark:bg-stone-950/90 backdrop-blur-md rounded-2xl shadow-2xl border border-stone-300 dark:border-stone-700 w-80 text-center transition-all duration-700 ${connected ? 'opacity-0 scale-150 pointer-events-none' : 'opacity-100 hover:scale-105'}`}>
            <LockKeyhole className="w-10 h-10 mb-4 text-stone-500 dark:text-stone-400" strokeWidth={1.5} />
            
            <h2 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-200 mb-2">Sealed Journal</h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 italic font-serif mb-8 px-2 leading-relaxed">
              Present your cryptographic seal to unbind these pages.
            </p>
            
            <div className="shadow-lg rounded-md overflow-hidden transform hover:scale-105 transition-transform duration-300">
              <WalletMultiButtonDynamic />
            </div>
          </div>
          
          {/* Subtle Background Title */}
          <div className={`absolute bottom-8 right-8 text-stone-300/30 dark:text-stone-800/30 text-6xl font-serif italic uppercase tracking-widest pointer-events-none select-none transition-opacity duration-500 ${connected ? 'opacity-0' : 'opacity-100'}`}>
            Tessera
          </div>
        </main>
      ) : (
        <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-10 items-start">
          {/* Left Page (Today's Entry) */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-6">
            <h2 className="text-lg sm:text-xl font-serif italic text-stone-600 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 pb-2 inline-block">
              Your pen is ready. Seal today&apos;s entry.
            </h2>
            
            <section className="w-full">
              <div className="bg-white dark:bg-stone-900/80 p-6 sm:p-8 rounded-2xl shadow-md border border-stone-200 dark:border-stone-800 relative z-10">
                <MintForm onMintSuccess={() => window.location.reload()} />
              </div>
            </section>
          </div>

          {/* Right Page (History & Share) */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-8 lg:mt-11">
            {loading && <p className="text-sm font-serif italic text-stone-500 animate-pulse bg-stone-100 dark:bg-stone-900 px-6 py-3 rounded-lg shadow-inner">Dusting off the archives...</p>}
            
            {error && (
              <div className="text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 px-6 py-4 rounded-lg flex items-center justify-between font-serif shadow-sm">
                <span>The scroll tore: {error}</span>
              </div>
            )}

            <section className="w-full flex justify-center overflow-auto rounded-2xl p-0 sm:p-0">
              <MosaicCanvas slots={slots} />
            </section>

            <section className="w-full pb-16">
              <ShareAchievement />
            </section>
          </div>
        </main>
      )}
    </div>
  );
}
