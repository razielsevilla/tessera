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
    <div className="border dark:border-white/[.145] p-6 rounded-xl w-full max-w-xl mx-auto flex flex-col gap-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Share2 className="w-5 h-5" /> Share Achievement (ZK Proof)
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Prove you met a certain threshold (e.g. 50 hours studied) without revealing your exact total.
      </p>

      <div className="flex gap-4">
        <label className="flex-1 flex flex-col gap-1 text-sm font-medium">
          Actual Value
          <input 
            type="number" 
            min="0"
            className="border p-2 rounded dark:bg-black dark:border-white/[.145]"
            value={value} 
            onChange={(e) => setValue(Number(e.target.value))} 
          />
        </label>
        <label className="flex-1 flex flex-col gap-1 text-sm font-medium">
          Minimum Threshold
          <input 
            type="number" 
            min="0"
            className="border p-2 rounded dark:bg-black dark:border-white/[.145]"
            value={threshold} 
            onChange={(e) => setThreshold(Number(e.target.value))} 
          />
        </label>
      </div>

      <button
        onClick={generateProof}
        disabled={loading}
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors disabled:opacity-50"
      >
        {loading ? 'Generating Proof...' : 'Generate Proof'}
      </button>

      {error && (
        <div className="flex items-center justify-between text-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800">
          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {error}</span>
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
              className="flex-1 border p-2 rounded bg-gray-50 text-gray-600 dark:bg-zinc-900 dark:text-zinc-400 dark:border-white/[.145] text-sm overflow-hidden text-ellipsis whitespace-nowrap"
            />
            <button 
              onClick={copyToClipboard}
              title="Copy verified link"
              className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-zinc-800 dark:border-white/[.145] transition-colors"
            >
              {copied ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <button
            onClick={copyEmbedCode}
            className="flex items-center justify-center gap-2 mt-2 w-full border border-gray-300 dark:border-white/[.145] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors p-2 rounded text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {embedCopied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Code className="w-4 h-4" />}
            {embedCopied ? 'Embed Code Copied!' : 'Copy Embed Widget Code'}
          </button>
        </div>
      )}
    </div>
  );
}
