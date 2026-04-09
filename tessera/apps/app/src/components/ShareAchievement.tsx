import React, { useState } from 'react';
import { engine } from '@tessera/engine';
import { CheckCircle2, Copy, Share2, AlertCircle, Code } from 'lucide-react';

export function ShareAchievement() {
  const [value, setValue] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);

  const generateProof = async () => {
    setLoading(true);
    setError(null);
    setLink(null);

    try {
      // Mock proving key since we don't have ark-circom setup natively
      const mockProvingKey = new Uint8Array(128);
      mockProvingKey.fill(1);

      // engine.zk.generate_threshold_proof
      // engine exposes zk functions, we need to access it
      const proofResult = engine.generateThresholdProof(value, threshold, mockProvingKey);
      
      const proofData = btoa(JSON.stringify(proofResult));
      const shareableLink = `${window.location.origin}/prove/${encodeURIComponent(proofData)}`;
      setLink(shareableLink);
    } catch (err: any) {
      console.error('Proof generation failed', err);
      setError(err?.message || 'Failed to generate ZK proof. Ensure your value >= threshold.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyEmbedCode = () => {
    if (link) {
      const embedUrl = link.replace('/prove/', '/embed/prove/');
      const embedHtml = `<iframe src="${embedUrl}" width="320" height="140" style="border:none;overflow:hidden;background:transparent;" allowtransparency="true" scrolling="no"></iframe>`;
      navigator.clipboard.writeText(embedHtml);
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8 rounded-2xl w-full max-w-2xl mx-auto flex flex-col gap-6 shadow-sm font-serif">
      <div className="flex flex-col border-b border-stone-100 dark:border-stone-800 pb-4">
        <h2 className="text-2xl font-serif text-stone-800 dark:text-stone-200 flex items-center gap-3">
          <Share2 className="w-5 h-5 text-stone-500" /> Share Achievement
        </h2>
        <p className="text-sm font-serif italic text-stone-500 mt-2">
          Prove you met a designated milestone without revealing your entire progress.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <label className="flex-1 flex flex-col gap-2 text-sm text-stone-600 dark:text-stone-400 italic">
          Total Accumulated
          <input 
            type="number" 
            min="0"
            className="border border-stone-200 dark:border-stone-700 p-3 rounded-lg bg-stone-50 dark:bg-stone-950 focus:ring-1 focus:ring-stone-500 outline-none transition-shadow"
            value={value} 
            onChange={(e) => setValue(Number(e.target.value))} 
          />
        </label>
        <label className="flex-1 flex flex-col gap-2 text-sm text-stone-600 dark:text-stone-400 italic">
          Target Milestone
          <input 
            type="number" 
            min="0"
            className="border border-stone-200 dark:border-stone-700 p-3 rounded-lg bg-stone-50 dark:bg-stone-950 focus:ring-1 focus:ring-stone-500 outline-none transition-shadow"
            value={threshold} 
            onChange={(e) => setThreshold(Number(e.target.value))} 
          />
        </label>
      </div>

      <button
        onClick={generateProof}
        disabled={loading}
        className="mt-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-serif font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 tracking-wide"
      >
        {loading ? 'Scribing Proof...' : 'Generate Proof'}
      </button>

      {error && (
        <div className="flex items-center justify-between text-rose-600 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 rounded-lg border border-rose-200 dark:border-rose-900">
          <span className="flex items-center gap-2 italic"><AlertCircle className="w-4 h-4"/> {error}</span>
        </div>
      )}

      {link && (
        <div className="flex flex-col gap-3 mt-4">
          <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Proof Generated Successfully!
          </span>
          <div className="flex items-center gap-2">
            <input 
              readOnly 
              value={link} 
              className="flex-1 border p-2 rounded bg-stone-50 text-stone-600 dark:bg-zinc-900 dark:text-zinc-400 dark:border-stone-800 text-sm overflow-hidden text-ellipsis whitespace-nowrap"
            />
            <button 
              onClick={copyToClipboard}
              title="Copy verified link"
              className="p-2 border rounded hover:bg-stone-100 dark:hover:bg-zinc-800 dark:border-stone-800 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <button
            onClick={copyEmbedCode}
            className="flex items-center justify-center gap-2 mt-2 w-full border border-stone-300 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors p-2 rounded text-sm font-medium text-stone-700 dark:text-stone-300"
          >
            {embedCopied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Code className="w-4 h-4" />}
            {embedCopied ? 'Embed Code Copied!' : 'Copy Embed Widget Code'}
          </button>
        </div>
      )}
    </div>
  );
}
