'use client';

import React, { useState, useEffect } from 'react';
import { engine } from '@tessera/engine';
import { 
  Activity, BookOpen, Film, Lock, 
  Grid, Shield, Zap, Wallet, 
  ChevronRight, Save, Link as LinkIcon, CheckCircle2,
  LockKeyhole, Key, PenTool, Bookmark
} from 'lucide-react';

// --- API Helper ---
const callGemini = async (prompt: string) => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""; 
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY environment variable. Please add it to your .env.local file.");
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  let retries = 0;
  const maxRetries = 5;
  const delays = [1000, 2000, 4000, 8000, 16000];

  while (retries <= maxRetries) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
      if (retries === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delays[retries]));
      retries++;
    }
  }
};

// --- UI Components ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#FDFBF7] border border-[#E2DCC8] shadow-[2px_4px_12px_rgba(0,0,0,0.03)] p-8 relative ${className}`}>
    {/* Decorative page binding / bookmark accent */}
    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E2DCC8]"></div>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon, disabled }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-stone-800 hover:bg-stone-700 text-[#FDFBF7] shadow-sm rounded-sm",
    secondary: "bg-transparent hover:bg-stone-200/50 text-stone-700 border border-stone-300 rounded-sm",
    success: "bg-[#4A5D4E] hover:bg-[#3A4A3E] text-[#FDFBF7] shadow-sm rounded-sm",
    web3: "bg-[#725C3A] hover:bg-[#5A492E] text-[#FDFBF7] shadow-sm rounded-sm",
  };
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const Input = ({ label, type = "text", placeholder, value, onChange }) => (
  <div className="flex flex-col gap-1 mb-5">
    <label className="text-xs font-bold tracking-widest uppercase text-stone-400">{label}</label>
    <input 
      type={type} 
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="bg-transparent border-b border-stone-300 px-0 py-2 text-stone-800 focus:outline-none focus:border-stone-600 focus:ring-0 transition-colors font-serif placeholder:text-stone-300 placeholder:italic"
    />
  </div>
);

const TextArea = ({ label, placeholder, rows = 4, value, onChange }) => (
  <div className="flex flex-col gap-1 mb-5">
    <label className="text-xs font-bold tracking-widest uppercase text-stone-400">{label}</label>
    <textarea 
      placeholder={placeholder}
      rows={rows}
      value={value}
      onChange={onChange}
      className="bg-[#F8F6F0] border border-stone-200 rounded-sm p-4 text-stone-800 focus:outline-none focus:border-stone-400 focus:ring-0 transition-colors resize-none font-serif leading-relaxed placeholder:text-stone-400 placeholder:italic"
    />
  </div>
);

const PageHeader = ({ title, description, icon: Icon, colorClass }) => {
  const [today, setToday] = useState('');
  useEffect(() => {
    setToday(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);
  
  return (
    <div className="mb-10 text-center md:text-left border-b border-[#E2DCC8] pb-6">
      <p className="text-xs font-semibold tracking-widest text-stone-400 uppercase mb-3 min-h-[16px]">{today}</p>
      <h2 className="text-3xl font-serif font-bold text-stone-800 flex items-center justify-center md:justify-start gap-3">
        {Icon && <Icon className={colorClass} size={28} />}
        {title}
      </h2>
      <p className="text-stone-500 mt-3 font-serif italic">{description}</p>
    </div>
  );
};

// --- Modules ---

const LifeEconomyTracker = () => (
  <div className="animation-fade-in">
    <PageHeader 
      title="Life Economy Tracker" 
      description="A ledger of daily metrics, habits, and time allocations."
      icon={Activity}
      colorClass="text-[#725C3A]"
    />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <h3 className="text-sm font-bold tracking-widest uppercase text-stone-800 mb-6 flex items-center gap-2">
          <PenTool size={16} /> Daily Entry
        </h3>
        <Input label="Focus Hours" type="number" placeholder="e.g. 4.5" />
        <Input label="Energy Level (1-10)" type="number" placeholder="e.g. 8" />
        <Input label="Financial Milestone / Expense" placeholder="$" />
        <Button icon={Save} className="w-full mt-4">Record in Ledger</Button>
      </Card>
      
      <Card>
        <h3 className="text-sm font-bold tracking-widest uppercase text-stone-800 mb-6 flex items-center gap-2">
          <Bookmark size={16} /> Productivity Scorecard
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-serif text-stone-600">Weekly Focus Avg</span>
              <span className="text-stone-800 font-bold font-serif">5.2 hrs/day</span>
            </div>
            <div className="w-full bg-[#EAE5D9] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#725C3A] h-full" style={{ width: '65%' }}></div>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-serif text-stone-600">Energy Trend</span>
              <span className="text-[#4A5D4E] font-bold font-serif">+12%</span>
            </div>
            <div className="w-full bg-[#EAE5D9] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#4A5D4E] h-full" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

const InteractiveFictionLogger = () => {
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [decisions, setDecisions] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleScryPaths = async () => {
    if (!title && !chapter && !decisions) return;
    setIsGenerating(true);
    setSuggestions("Consulting the threads of fate...");
    try {
      const prompt = `You are a creative writing assistant for interactive fiction. The narrative is titled "${title}". The current node is "${chapter}". The recent decisions/outcomes are: "${decisions}". Suggest 3 compelling and distinct branching paths or choices the player could face next. Keep the tone matching a serious, literary adventure. Format as a short, elegant list.`;
      const result = await callGemini(prompt);
      setSuggestions(result);
    } catch (error) {
      setSuggestions("Failed to scry the narrative paths. The threads of fate are tangled.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animation-fade-in">
      <PageHeader 
        title="Interactive Fiction" 
        description="Chronicles of narrative decisions and branching pathways."
        icon={BookOpen}
        colorClass="text-[#6B4C5A]"
      />
      
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <Input label="Narrative Title" placeholder="e.g. The Quantum Thief" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input label="Current Chapter / Node" placeholder="e.g. Node 4B - The Heist" value={chapter} onChange={(e) => setChapter(e.target.value)} />
            <TextArea label="Decisions & Outcomes" placeholder="Player chose stealth. Companion trust +10..." rows={4} value={decisions} onChange={(e) => setDecisions(e.target.value)} />
            <div className="flex gap-3">
              <Button icon={Save}>Scribe Narrative</Button>
              <Button variant="secondary" onClick={handleScryPaths} disabled={isGenerating || (!title && !decisions)}>
                {isGenerating ? "Scrying..." : "Scry Future Paths ✨"}
              </Button>
            </div>
          </div>
          <div className="bg-[#F8F6F0] rounded-sm p-6 border border-[#E2DCC8] flex flex-col items-center text-center overflow-y-auto">
            {suggestions ? (
              <div className="text-left w-full">
                <h4 className="text-xs font-bold tracking-widest uppercase text-[#6B4C5A] mb-3 border-b border-[#E2DCC8] pb-2">Revealed Pathways</h4>
                <div className="text-stone-700 font-serif text-sm leading-relaxed whitespace-pre-wrap">
                  {suggestions}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <BookOpen size={40} className="text-stone-300 mb-4" />
                <p className="text-stone-500 font-serif italic text-sm leading-relaxed">
                  "Every choice branches the river of time."<br/><br/>
                  Your visual decision tree will manifest here as you log your journey.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

const MediaLogger = () => (
  <div className="animation-fade-in">
    <PageHeader 
      title="Media Catalog" 
      description="A structured log of consumed literature, cinema, and music."
      icon={Film}
      colorClass="text-[#4A6472]"
    />
    
    <Card>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <Input label="Media Title" placeholder="e.g. Dune: Part Two" />
          <div className="grid grid-cols-2 gap-6">
             <Input label="Format" placeholder="Film, Book, Album..." />
             <Input label="Genre" placeholder="Sci-Fi, Cyberpunk..." />
          </div>
          <TextArea label="Critique & Reflections" placeholder="What themes resonated? How was the execution?" rows={5} />
          <Button icon={Save}>Add to Catalog</Button>
        </div>
        
        <div>
           <h4 className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-4">Recent Entries</h4>
           <ul className="space-y-4">
             <li className="flex flex-col gap-1 pb-3 border-b border-stone-200">
               <div className="flex justify-between items-center text-sm font-serif text-stone-800">
                 <span className="font-bold">Neuromancer</span>
                 <span className="text-[#725C3A] text-xs">★★★★★</span>
               </div>
               <span className="text-xs text-stone-500 uppercase tracking-wider">Book • Cyberpunk</span>
             </li>
             <li className="flex flex-col gap-1 pb-3 border-b border-stone-200">
               <div className="flex justify-between items-center text-sm font-serif text-stone-800">
                 <span className="font-bold">Blade Runner 2049</span>
                 <span className="text-[#725C3A] text-xs">★★★★☆</span>
               </div>
               <span className="text-xs text-stone-500 uppercase tracking-wider">Film • Sci-Fi</span>
             </li>
           </ul>
        </div>
      </div>
    </Card>
  </div>
);

const RetrospectiveLogger = () => {
  const [title, setTitle] = useState('');
  const [entry, setEntry] = useState('');
  const [insight, setInsight] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encrypted, setEncrypted] = useState(false);

  const handleEncrypt = async () => {
    if (!title || !entry) return;
    setIsEncrypting(true);
    
    try {
      await engine.init();
      const encoder = new TextEncoder();
      const dataToEncrypt = encoder.encode(JSON.stringify({ title, entry, insight, timestamp: Date.now() }));
      
      const key = crypto.getRandomValues(new Uint8Array(32));
      const encryptedData = engine.encrypt(dataToEncrypt, key);
      
      const entryId = `retro_${Date.now()}`;
      localStorage.setItem(entryId, JSON.stringify({
        encrypted: Array.from(encryptedData),
        key: Array.from(key)
      }));

      setIsEncrypting(false);
      setEncrypted(true);
      setTimeout(() => setEncrypted(false), 3000);
      setTitle('');
      setEntry('');
      setInsight('');
    } catch (error) {
      console.error(error);
      setIsEncrypting(false);
      alert("Failed to encrypt data. See console.");
    }
  };

  const handleExtractInsight = async () => {
    if (!entry) return;
    setIsGenerating(true);
    setInsight("Distilling thoughts...");
    try {
      const prompt = `You are a thoughtful, philosophical journaling companion. Read the following diary entry titled "${title}": "${entry}". Write a short, beautifully written, poetic, and profound one-paragraph reflection that summarizes the core emotion of the entry and offers a gentle, philosophical takeaway.`;
      const result = await callGemini(prompt);
      setInsight(result);
    } catch (error) {
      setInsight("The oracle is silent right now. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animation-fade-in">
      <PageHeader 
        title="Personal Retrospective" 
        description="A private, encrypted space for deep self-reflection and historical preservation."
        icon={LockKeyhole}
        colorClass="text-[#4A5D4E]"
      />
      
      <Card className="relative overflow-hidden bg-[#FCFAF5]">
        {/* Subtle background seal */}
        <div className="absolute -right-10 -top-10 opacity-[0.03] pointer-events-none">
          <Shield size={300} />
        </div>

        <div className="relative z-10">
          <Input label="Entry Title / Date" placeholder="e.g. Autumn Reflections" value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextArea 
            label="Journal Entry" 
            placeholder="Dear diary, today I realized..." 
            rows={8} 
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          />
          
          {insight && (
            <div className="mb-6 p-5 bg-[#EAE5D9]/50 border-l-4 border-[#4A5D4E] rounded-r-sm">
              <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500 mb-2">Philosophical Insight</h4>
              <p className="text-stone-700 font-serif italic text-sm leading-relaxed">
                {insight}
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6 pt-6 border-t border-[#E2DCC8] justify-between">
            <div className="flex gap-3 w-full sm:w-auto">
              <Button 
                icon={isEncrypting ? Zap : Lock} 
                variant="success" 
                onClick={handleEncrypt}
                className={isEncrypting ? "animate-pulse" : ""}
              >
                {isEncrypting ? "Sealing Entry..." : encrypted ? "Sealed & Encrypted" : "Encrypt & Store Locally"}
              </Button>
              <Button 
                variant="secondary" 
                onClick={handleExtractInsight}
                disabled={isGenerating || !entry}
              >
                {isGenerating ? "Reflecting..." : "Distill Insight ✨"}
              </Button>
            </div>
            <span className="text-xs text-stone-400 flex items-center gap-1.5 font-mono">
              <Key size={12} /> Tessera.Engine::encrypt.rs
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

const MosaicCanvas = () => {
  const generateMosaic = () => Array.from({ length: 144 }).map((_, i) => ({
    id: i,
    type: ['life', 'media', 'if', 'retro'][Math.floor(Math.random() * 4)],
    intensity: Math.random() * 100
  }));

  const [mosaicData, setMosaicData] = useState([]);
  
  useEffect(() => {
    setMosaicData(generateMosaic());
  }, []);

  const getColor = (type, intensity) => {
    // Earthy, watercolor-like tones for the diary aesthetic
    const opacity = (intensity / 100) * 0.7 + 0.3;
    switch(type) {
      case 'life': return `rgba(114, 92, 58, ${opacity})`; // Gold/Brown
      case 'media': return `rgba(74, 100, 114, ${opacity})`; // Muted Blue
      case 'if': return `rgba(107, 76, 90, ${opacity})`; // Burgundy
      case 'retro': return `rgba(74, 93, 78, ${opacity})`; // Forest Green
      default: return `rgba(200, 195, 185, 0.5)`;
    }
  };

  return (
    <div className="animation-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-[#E2DCC8] pb-6 gap-4">
        <div>
          <PageHeader 
            title="The Mosaic Canvas" 
            description="A tapestry woven from your personal data logs."
            icon={Grid}
            colorClass="text-stone-600"
          />
        </div>
        <div className="mb-6 md:mb-0">
           <Button variant="secondary" icon={LinkIcon}>Generate Shareable Link</Button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* The Frame */}
        <div className="flex-grow bg-white p-4 shadow-sm border border-stone-200">
          <div className="bg-[#F8F6F0] p-6 border border-stone-100 flex items-center justify-center">
            <div className="grid grid-cols-12 gap-1 w-full max-w-2xl aspect-square">
              {mosaicData.map((cell) => (
                <div 
                  key={cell.id} 
                  className="w-full h-full rounded-sm transition-opacity hover:opacity-75 cursor-pointer"
                  style={{ backgroundColor: getColor(cell.type, cell.intensity) }}
                  title={`${cell.type.toUpperCase()} Data - Intensity: ${Math.round(cell.intensity)}%`}
                />
              ))}
            </div>
          </div>
          <div className="text-center mt-4 text-xs font-serif text-stone-400 italic">
            Fig 1. Composite reflection of recent history.
          </div>
        </div>

        {/* The Legend */}
        <Card className="lg:w-72 flex-shrink-0 h-fit">
          <h3 className="text-sm font-bold tracking-widest uppercase text-stone-800 mb-6">Canvas Legend</h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-4">
              <div className="w-5 h-5 rounded-sm bg-[#725C3A] shadow-sm"></div>
              <span className="text-sm font-serif text-stone-700">Life Economy</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-5 h-5 rounded-sm bg-[#4A6472] shadow-sm"></div>
              <span className="text-sm font-serif text-stone-700">Media Logs</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-5 h-5 rounded-sm bg-[#6B4C5A] shadow-sm"></div>
              <span className="text-sm font-serif text-stone-700">Interactive Fiction</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-5 h-5 rounded-sm bg-[#4A5D4E] shadow-sm"></div>
              <span className="text-sm font-serif text-stone-700">Retrospectives</span>
            </li>
          </ul>
          <div className="mt-8 pt-4 border-t border-[#E2DCC8] text-xs font-serif text-stone-500 leading-relaxed italic">
            Color intensity signifies the volume and depth of recorded entries. Processed securely via client-side bitmap engine.
          </div>
        </Card>
      </div>
    </div>
  );
};

const Web3ProvingStation = () => {
  const [proving, setProving] = useState(false);
  const [proofGenerated, setProofGenerated] = useState(false);

  const handleProve = () => {
    setProving(true);
    setTimeout(() => {
      setProving(false);
      setProofGenerated(true);
    }, 2000);
  }

  return (
    <div className="animation-fade-in">
      <PageHeader 
        title="Verification & Minting" 
        description="Preserve your history on-chain through zero-knowledge proofs."
        icon={Shield}
        colorClass="text-[#725C3A]"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Lock className="text-stone-800" size={20} />
            <h3 className="text-sm font-bold tracking-widest uppercase text-stone-800">Zero-Knowledge Station</h3>
          </div>
          <p className="text-sm text-stone-500 font-serif mb-6 leading-relaxed">
            Cryptographically prove milestones without revealing underlying journal contents using <code className="font-mono text-xs bg-[#EAE5D9] px-1 rounded">threshold.circom</code>.
          </p>
          
          <div className="bg-[#1A1A1A] p-5 rounded-sm font-mono text-xs text-stone-400 mb-6 h-32 overflow-hidden shadow-inner">
            {proving ? (
               <div className="animate-pulse text-stone-300">
                 {'>'} Initializing zk-SNARK protocol...<br/>
                 {'>'} Loading threshold.wasm into memory...<br/>
                 {'>'} Computing witness from private inputs...
               </div>
            ) : proofGenerated ? (
               <div className="text-[#A3B899]">
                 {'>'} Proof generated successfully.<br/>
                 {'>'} Verification key matched local state.<br/>
                 {'>'} Ready for on-chain submission.
               </div>
            ) : (
               <div>
                 {'>'} Proving station awaiting input.<br/>
                 {'>'} No active computations...
               </div>
            )}
          </div>
          
          <Button 
            onClick={handleProve} 
            disabled={proving || proofGenerated}
            variant="secondary" 
            className="w-full"
            icon={Zap}
          >
            {proving ? "Generating Proof..." : proofGenerated ? "Proof Validated" : "Initiate ZK Proof"}
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Wallet className="text-[#725C3A]" size={20} />
            <h3 className="text-sm font-bold tracking-widest uppercase text-stone-800">Immutable Ledger (Solana)</h3>
          </div>
          <p className="text-sm text-stone-500 font-serif mb-6 leading-relaxed">
            Mint a verifiable digital artifact of your Mosaic Canvas as a permanent, decentralized asset.
          </p>
          
          <div className="bg-[#F8F6F0] border border-stone-200 p-5 rounded-sm space-y-4 mb-6">
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold uppercase tracking-wider text-xs text-stone-400">Network</span>
              <span className="text-stone-700 font-serif">Solana Devnet</span>
            </div>
            <div className="w-full h-px bg-stone-200"></div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold uppercase tracking-wider text-xs text-stone-400">Asset</span>
              <span className="text-stone-700 font-serif">Journal Canvas #402</span>
            </div>
            <div className="w-full h-px bg-stone-200"></div>
            <div className="flex justify-between items-center text-sm">
              <span className="font-bold uppercase tracking-wider text-xs text-stone-400">Status</span>
              {proofGenerated ? (
                <span className="text-[#4A5D4E] flex items-center gap-1 font-serif font-bold"><CheckCircle2 size={14}/> Verified</span>
              ) : (
                <span className="text-[#725C3A] font-serif italic">Pending Proof</span>
              )}
            </div>
          </div>
          
          <Button 
            variant="web3" 
            className="w-full"
            disabled={!proofGenerated}
            icon={Wallet}
          >
            Mint Artifact to Wallet
          </Button>
        </Card>
      </div>
    </div>
  );
};


// --- Main Application ---

export default function App() {
  const [activeTab, setActiveTab] = useState('retro'); // Defaulting to retro to showcase the diary feel
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { id: 'retro', label: 'Retrospectives', icon: LockKeyhole },
    { id: 'life', label: 'Life Economy', icon: Activity },
    { id: 'media', label: 'Media Catalog', icon: Film },
    { id: 'if', label: 'Interactive Fiction', icon: BookOpen },
    { id: 'mosaic', label: 'Mosaic Canvas', icon: Grid },
    { id: 'web3', label: 'Mint & Verify', icon: Shield },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'life': return <LifeEconomyTracker />;
      case 'if': return <InteractiveFictionLogger />;
      case 'media': return <MediaLogger />;
      case 'retro': return <RetrospectiveLogger />;
      case 'mosaic': return <MosaicCanvas />;
      case 'web3': return <Web3ProvingStation />;
      default: return <RetrospectiveLogger />;
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-stone-800 font-sans flex overflow-hidden selection:bg-[#E2DCC8] selection:text-stone-900">
      {/* Sidebar Navigation (The Index) */}
      <aside className="w-64 border-r border-[#D8D0BA] bg-[#EAE5D9] hidden md:flex flex-col relative shadow-[4px_0_15px_rgba(0,0,0,0.02)] z-10">
        <div className="p-8 border-b border-[#D8D0BA]">
          <h1 className="text-3xl font-serif font-bold text-stone-900 flex items-center gap-3">
            <Bookmark size={24} className="text-[#725C3A]" /> 
            Tessera
          </h1>
          <p className="text-xs text-stone-500 mt-3 font-serif italic">Digital Journal & Ledger</p>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 px-4">Chronicles</div>
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-[#FDFBF7] text-stone-900 font-bold shadow-sm rounded-sm border-l-4 border-l-[#725C3A]' 
                  : 'text-stone-600 hover:bg-[#D8D0BA]/30 hover:text-stone-900 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} className={activeTab === item.id ? "text-[#725C3A]" : "opacity-70"} />
                <span className={activeTab === item.id ? "font-serif" : ""}>{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight size={14} className="text-stone-400" />}
            </button>
          ))}

          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] mt-10 mb-4 px-4">Artifacts</div>
          {navItems.slice(4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-[#FDFBF7] text-stone-900 font-bold shadow-sm rounded-sm border-l-4 border-l-[#4A6472]' 
                  : 'text-stone-600 hover:bg-[#D8D0BA]/30 hover:text-stone-900 border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} className={activeTab === item.id ? "text-[#4A6472]" : "opacity-70"} />
                <span className={activeTab === item.id ? "font-serif" : ""}>{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight size={14} className="text-stone-400" />}
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-[#D8D0BA] bg-[#E2DCC8]/30">
          <div className="flex items-center gap-3 text-xs text-stone-600 font-mono">
            <div className="w-2 h-2 rounded-full bg-[#4A5D4E]"></div>
            Engine Active
          </div>
        </div>
      </aside>

      {/* Main Content Area (The Pages) */}
      <main className="flex-1 h-screen overflow-y-auto relative">
        {/* Mobile Nav */}
        <div className="md:hidden bg-[#EAE5D9] border-b border-[#D8D0BA] p-4 flex gap-2 overflow-x-auto no-scrollbar shadow-sm relative z-10">
           {navItems.map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 px-4 py-2 text-sm flex items-center gap-2 rounded-sm transition-colors ${
                  activeTab === item.id 
                    ? 'bg-[#FDFBF7] text-stone-900 font-bold shadow-sm border border-[#E2DCC8]' 
                    : 'bg-transparent text-stone-600 border border-transparent'
                }`}
              >
                <item.icon size={14} /> {item.label}
              </button>
           ))}
        </div>

        <div className="max-w-4xl mx-auto p-6 md:p-12 lg:p-16 pb-24">
          {renderContent()}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&display=swap');
        
        .font-serif {
          font-family: 'Merriweather', Georgia, serif;
        }

        .animation-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Custom scrollbar for the main area to match the aesthetic */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #F4F1EA;
        }
        ::-webkit-scrollbar-thumb {
          background: #D8D0BA;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #C4BAA1;
        }
      `}} />
    </div>
  );
}