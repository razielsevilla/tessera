'use client';

import React, { useEffect, useState, use } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export default function EmbedProvePage({ params }: { params: Promise<{ data: string }> }) {
  const [proof, setProof] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    try {
      const decodedStr = atob(decodeURIComponent(resolvedParams.data));
      const parsed = JSON.parse(decodedStr);
      setProof(parsed);
    } catch (e) {
      console.error(e);
      setError('Invalid proof data.');
    }
  }, [resolvedParams.data]);

  return (
    <div className="flex items-center justify-center font-[family-name:var(--font-geist-sans)] h-screen w-full bg-transparent overflow-hidden object-contain m-0 p-0">
      <div className="border p-4 rounded-xl w-full max-w-sm shadow-sm dark:border-white/[.145] dark:bg-zinc-900 bg-white flex flex-col m-1">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold flex items-center gap-2 m-0 text-gray-800 dark:text-gray-200">
            <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" /> Tessera Verified
          </h2>
          <a 
            href={`/prove/${resolvedParams.data}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 m-0"
          >
            Details↗
          </a>
        </div>
        
        {error ? (
          <div className="text-red-500 flex items-center gap-2 mt-2 text-xs font-medium">
             <AlertTriangle className="w-4 h-4"/> {error}
          </div>
        ) : !proof ? (
          <p className="text-left text-xs opacity-50 mt-2 m-0">Loading proof...</p>
        ) : (
           <div className="flex flex-col gap-1 mt-3">
             <p className="text-xs text-gray-600 dark:text-gray-400 m-0 leading-tight">
               ZK Proof confirms user achieved threshold of:
             </p>
             <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 leading-none">
               {proof.public_signals ? new DataView(new Uint8Array(proof.public_signals).buffer).getUint32(0, true) : '???'}
             </div>
           </div>
        )}
      </div>
    </div>
  );
}