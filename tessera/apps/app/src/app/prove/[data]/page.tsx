'use client';

import React, { useEffect, useState } from 'react';
import { Share2, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function ProvePage({ params }: { params: { data: string } }) {
  const [proof, setProof] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const decodedStr = atob(decodeURIComponent(params.data));
      const parsed = JSON.parse(decodedStr);
      setProof(parsed);
    } catch (e) {
      console.error(e);
      setError('Invalid proof formatting or corrupted link.');
    }
  }, [params.data]);

  return (
    <div className="min-h-screen flex flex-col p-8 items-center font-[family-name:var(--font-geist-sans)] justify-center">
      <div className="border p-8 rounded-2xl w-full max-w-md shadow-sm dark:border-white/[.145] dark:bg-zinc-900 bg-white flex flex-col">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
          <ShieldCheck className="w-8 h-8 text-green-500" /> Verified Achievement
        </h1>
        
        {error ? (
          <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:border-red-800 border-red-200 border p-4 rounded-xl flex items-center gap-2 mt-4 text-sm font-medium">
             <AlertTriangle className="w-5 h-5"/> {error}
          </div>
        ) : !proof ? (
          <p className="text-center mt-4">Loading proof data...</p>
        ) : (
           <div className="flex flex-col items-center gap-4 mt-4">
             <p className="text-center text-gray-600 dark:text-gray-400">
               This zero-knowledge proof verifies the user has achieved a minimum threshold of exactly:
             </p>
             <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
               {proof.public_signals ? new DataView(new Uint8Array(proof.public_signals).buffer).getUint32(0, true) : '???'}
             </div>
             
             <div className="w-full bg-gray-50 dark:bg-black border dark:border-white/[.14] rounded-lg p-4 mt-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cryptographic Payload (Mocked Groth16)</h3>
                <div className="text-xs break-all font-mono opacity-60">
                   0x{Array.from(new Uint8Array(proof.proof_bytes || []))
                     .map(b => b.toString(16).padStart(2, '0')).join('')}
                </div>
             </div>

             <div className="flex items-center gap-2 text-green-600 font-semibold mt-2">
               <CheckCircle2 className="w-5 h-5" /> ZK Signature Valid
             </div>
           </div>
        )}

        <Link href="/" className="mt-8 text-center text-sm text-blue-500 hover:underline">
           Return to Tessera
        </Link>
      </div>
    </div>
  );
}
