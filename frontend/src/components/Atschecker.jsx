import { useState, useEffect } from 'react';

export default function AtsChecker() {
  const [file, setFile] = useState(null);
  const [scanState, setScanState] = useState('idle'); // idle, scanning, complete, autofixing, fixed
  const [scanProgress, setScanProgress] = useState(0);
  const [scanText, setScanText] = useState('Initializing AI engine...');
  const [terminalLogs, setTerminalLogs] = useState([]);

  // Phase 1: Upload (KEPT EXACTLY THE SAME)
  const handleUpload = (e) => {
    const uploadedFile = e.target.files[0] || e.dataTransfer?.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setScanState('scanning');
    setScanProgress(0);
    setTerminalLogs(['[SYSTEM] Initializing secure environment...']);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    handleUpload(e);
  };

  // Advanced Scanning Effects
  useEffect(() => {
    if (scanState === 'scanning' || scanState === 'autofixing') {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setScanState(scanState === 'scanning' ? 'complete' : 'fixed'), 800);
            return 100;
          }
          
          const newProgress = prev + 1;
          
          // Terminal Log Generation
          if (scanState === 'scanning') {
            if (newProgress === 10) addLog('[PARSER] Extracting text nodes and metadata...');
            if (newProgress === 35) addLog('[AI] Running heuristic layout analysis...');
            if (newProgress === 60) addLog('[VECTOR] Cross-referencing 10,000+ industry keywords...');
            if (newProgress === 85) addLog('[SCORING] Compiling final ATS match metrics...');
          } else {
            if (newProgress === 10) addLog('[LLM] Connecting to neural cluster...');
            if (newProgress === 30) addLog('[LLM] Rewriting 5 passive bullet points to active voice...');
            if (newProgress === 60) addLog('[LLM] Injecting missing core competencies...');
            if (newProgress === 85) addLog('[SYSTEM] Recompiling PDF to ATS-friendly format...');
          }

          return newProgress;
        });
      }, scanState === 'scanning' ? 40 : 60);
      return () => clearInterval(interval);
    }
  }, [scanState]);

  const addLog = (log) => {
    setTerminalLogs(prev => [...prev, log].slice(-4)); // Keep last 4 logs
  };

  const triggerAutoFix = () => {
    setScanState('autofixing');
    setScanProgress(0);
    setTerminalLogs(['[SYSTEM] Initiating AI Auto-Fix sequence...']);
  };

  const resetScanner = () => {
    setFile(null);
    setScanState('idle');
    setScanProgress(0);
    setTerminalLogs([]);
  };

  return (
    <div className="relative w-full min-h-screen pt-24 pb-20 transition-colors duration-300 flex flex-col items-center overflow-hidden">
      
      {/* Premium SaaS Dotted Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-20 pointer-events-none"></div>
      <div className="absolute top-20 left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* =========================================================================================
            PHASE 1: IDLE (UPLOAD) - EXACTLY AS REQUESTED. DO NOT CHANGE. 
            ========================================================================================= */}
        {scanState === 'idle' && (
           <div className="grid lg:grid-cols-2 gap-16 items-center animate-[fadeIn_0.5s_ease-out] pt-10">
           {/* Left Side: Education */}
           <div className="max-w-xl">
             <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-3 py-1.5 rounded-full mb-6 shadow-sm">
               <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
               <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Free Analysis</span>
             </div>
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tight leading-[1.1]">
               Beat the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">Bots.</span> <br />
               Land the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Interview.</span>
             </h1>
             <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 font-medium leading-relaxed">
               <strong className="text-slate-900 dark:text-slate-200">75% of resumes are never seen by a human.</strong> Companies use Applicant Tracking Systems (ATS) to filter out candidates before the recruiter even opens the file.
             </p>

             <div className="space-y-5 mb-10">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-indigo-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Keyword Optimization</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">We check if you have the exact terminology the ATS algorithm is programmed to find.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-blue-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Formatting Parsability</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Complex columns and graphics break ATS bots. We ensure your data is perfectly readable.</p>
                  </div>
                </div>
              </div>
           </div>

           {/* Right Side: Upload Box */}
           <div className="relative group w-full max-w-lg mx-auto lg:mx-0" onDragOver={handleDragOver} onDrop={handleDrop}>
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
             <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
               <div className="text-center mb-6">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white">Upload Resume</h3>
                 <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Find out your true score in seconds.</p>
               </div>
               <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-indigo-300 dark:border-indigo-500/50 rounded-3xl bg-indigo-50/50 dark:bg-slate-800/50 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition-all cursor-pointer">
                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
                   <div className="w-20 h-20 mb-6 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-300">
                     <svg className="w-10 h-10 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                   </div>
                   <p className="mb-2 text-xl font-bold text-slate-700 dark:text-slate-200">Drag & Drop</p>
                   <p className="text-slate-500 dark:text-slate-400 text-sm font-medium px-8 text-center">or click to browse your files (PDF, DOCX)</p>
                 </div>
                 <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleUpload} />
               </label>
               <div className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                  Private & Secure. We don't store your data.
                </div>
             </div>
           </div>
         </div>
        )}

        {/* =========================================================================================
            PHASE 2 & 4: ENTERPRISE TERMINAL LOADING UI
            ========================================================================================= */}
        {(scanState === 'scanning' || scanState === 'autofixing') && (
          <div className="flex flex-col items-center justify-center py-10 w-full max-w-3xl mx-auto animate-[fadeIn_0.5s_ease-out]">
            
            {/* Terminal Window */}
            <div className="w-full bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden mb-8 relative">
              
              {/* Terminal Header */}
              <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  {scanState === 'autofixing' ? 'llm-optimization.sh' : 'ats-analyzer.sh'}
                </div>
              </div>

              {/* Terminal Body */}
              <div className="p-6 h-64 font-mono text-sm overflow-hidden relative">
                {/* Glowing Scanner Line over code */}
                <div className={`absolute left-0 right-0 h-32 blur-2xl opacity-20 z-0 ${scanState === 'autofixing' ? 'bg-purple-500' : 'bg-indigo-500'}`} style={{ animation: 'scanLaser 2s infinite ease-in-out alternate' }}></div>
                
                <style>{`@keyframes scanLaser { 0% { top: -20%; } 100% { top: 100%; } }`}</style>
                
                <div className="relative z-10 flex flex-col space-y-3">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className={`${i === terminalLogs.length - 1 ? (scanState === 'autofixing' ? 'text-purple-400' : 'text-indigo-400') : 'text-slate-500'}`}>
                      <span className="opacity-50 mr-2">{'>'}</span>{log}
                    </div>
                  ))}
                  <div className="text-slate-500 animate-pulse"><span className="opacity-50 mr-2">{'>'}</span>_</div>
                </div>
              </div>
            </div>

            {/* Premium Progress Bar */}
            <div className="w-full max-w-xl">
              <div className="flex justify-between text-sm font-bold font-mono mb-2">
                <span className={scanState === 'autofixing' ? 'text-purple-400' : 'text-indigo-400'}>
                  {scanState === 'autofixing' ? 'OPTIMIZING...' : 'ANALYZING...'}
                </span>
                <span className="text-slate-400">{scanProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden shadow-inner border border-slate-800">
                <div className={`h-full rounded-full transition-all duration-75 ease-linear relative ${scanState === 'autofixing' ? 'bg-gradient-to-r from-purple-600 to-pink-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'}`} style={{ width: `${scanProgress}%` }}>
                  <div className="absolute inset-0 bg-white/20"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================================
            PHASE 3: ENTERPRISE RESULTS DASHBOARD
            ========================================================================================= */}
        {scanState === 'complete' && (
          <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-6xl mx-auto pt-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">ATS Audit Report</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Target Document: <span className="font-mono text-slate-900 dark:text-white">{file?.name}</span></p>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              
              {/* Overall Score Box */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 w-full text-center">Match Probability</h3>
                
                <div className="relative w-48 h-48 flex items-center justify-center mb-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="6" fill="none" />
                    <circle cx="50" cy="50" r="40" className="stroke-amber-500 transition-all duration-1000 ease-out" strokeWidth="6" fill="none" strokeLinecap="round" style={{ strokeDasharray: 251.2, strokeDashoffset: 251.2 - (251.2 * 68) / 100 }} />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-6xl font-black font-mono text-slate-900 dark:text-white tracking-tighter">68</span>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-sm mt-1 border border-amber-500/20">Needs Work</span>
                  </div>
                </div>
                <p className="text-center text-slate-500 dark:text-slate-400 text-sm font-medium mt-4">
                  Will likely be flagged by Taleo and Workday systems due to missing hard skills.
                </p>
              </div>

              {/* Data Breakdown & Actions */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Auto Fix Card (The SaaS Up-sell visual) */}
                <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-1 rounded-2xl shadow-2xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
                   <div className="bg-slate-950/80 backdrop-blur-md p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 border border-indigo-500/20">
                     <div>
                       <h3 className="text-xl font-black text-white mb-1 flex items-center gap-2">
                         <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z"></path></svg>
                         AI Auto-Fix Ready
                       </h3>
                       <p className="text-indigo-200/70 text-sm font-medium">Let our LLM rewrite your weak bullets and inject missing keywords instantly.</p>
                     </div>
                     <button onClick={triggerAutoFix} className="whitespace-nowrap px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                       Optimize Resume Now
                     </button>
                   </div>
                </div>

                {/* Critical Issues Glass Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <h4 className="font-bold text-slate-900 dark:text-red-100 text-sm">Keyword Deficiency</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-red-200/70">Missing 8 core competencies required for this role level (e.g. "REST APIs").</p>
                  </div>
                  
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                      <h4 className="font-bold text-slate-900 dark:text-amber-100 text-sm">Passive Phrasing</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-amber-200/70">Found 4 instances of "responsible for". Semantic engines score active verbs higher.</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* =========================================================================================
            PHASE 4: FIXED / SUCCESS DASHBOARD (CHANGELOG)
            ========================================================================================= */}
        {scanState === 'fixed' && (
          <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-5xl mx-auto pt-8">
            
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 mb-6 border border-green-200 dark:border-green-500/20">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">Resume Optimized.</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Your document is now calibrated to bypass enterprise filtering algorithms.</p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left: Score Upgrade Card */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-8">Score Improvement</h3>
                
                <div className="flex items-center justify-center gap-6 mb-8">
                  <div className="text-center opacity-40">
                    <span className="block text-3xl font-mono font-black text-slate-500 line-through">68</span>
                    <span className="text-[10px] font-bold uppercase">Old Score</span>
                  </div>
                  
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  
                  <div className="text-center relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
                    <span className="relative block text-6xl font-mono font-black text-green-500 drop-shadow-md">98</span>
                    <span className="relative text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-0.5 rounded-sm mt-1 border border-green-500/20">Excellent</span>
                  </div>
                </div>

                <button className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Download ATS PDF
                </button>
                <button onClick={resetScanner} className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
                  Analyze another file
                </button>
              </div>

              {/* Right: AI Audit Log (Changelog) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700/50">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                    AI Optimization Log
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 text-green-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></div>
                    <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white font-medium">Re-formatted layout:</strong> Stripped multi-column tables and converted to a safe, single-column flow for Taleo compatibility.</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 text-green-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></div>
                    <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white font-medium">Injected keywords:</strong> Seamlessly added 12 high-value industry terms (e.g., "REST APIs", "CI/CD", "Agile") into contextually relevant bullet points.</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 text-green-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></div>
                    <p className="text-slate-600 dark:text-slate-300"><strong className="text-slate-900 dark:text-white font-medium">Active Voice Conversion:</strong> Rewrote 4 passive sentences, replacing "responsible for" with high-impact action verbs ("Architected", "Spearheaded").</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}