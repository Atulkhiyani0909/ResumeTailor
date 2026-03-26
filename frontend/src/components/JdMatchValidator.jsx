import { useState, useEffect } from 'react';

export default function JdMatchValidator() {
  const [step, setStep] = useState('input'); 
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  

  const [matchScore, setMatchScore] = useState(62);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanText, setScanText] = useState('Initializing AI engine...');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [userFeedback, setUserFeedback] = useState('');

  
  useEffect(() => {
    if (step === 'analyzing' || step === 'refixing') {
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setStep('results');
              setFeedbackOpen(false);
              setUserFeedback('');
            }, 600);
            return 100;
          }
          
          const newProgress = prev + 1;
          
          if (step === 'analyzing') {
            if (newProgress === 10) setScanText('Extracting JD requirements & context...');
            if (newProgress === 35) setScanText('Vectorizing resume experience data...');
            if (newProgress === 60) setScanText('Calculating cosine similarity matches...');
            if (newProgress === 85) setScanText('Drafting AI improvement plan...');
          } else {
            if (newProgress === 10) setScanText('Processing human feedback...');
            if (newProgress === 40) setScanText('Rewriting bullet points with new context...');
            if (newProgress === 70) setScanText('Recalculating ATS match probability...');
            if (newProgress === 90) setScanText('Finalizing optimized document format...');
          }

          return newProgress;
        });
      }, 50); 
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleStartAnalysis = () => {
    if (!file || !jdText.trim()) return alert("Please upload a resume and paste a JD.");
    setStep('analyzing');
    setMatchScore(62); 
  };

  const handleRefixSubmit = () => {
    if (!userFeedback.trim()) return;
    setStep('refixing');
  };

  return (
    <div className="relative w-full min-h-screen pt-24 pb-20 transition-colors duration-300 flex flex-col items-center overflow-x-hidden">
      
     
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 dark:opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">

       
        {step === 'input' && (
          <div className="flex flex-col items-center animate-[fadeIn_0.5s_ease-out] pt-10">
            
         
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-4 py-2 rounded-full mb-8 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">AI Copilot Tailoring</span>
              </div>
              
              <h1 className="text-3xl md:text-5xl lg:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Tailor your resume to <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">any Job Description.</span>
              </h1>
              <p className="text-lg md:text-lg text-slate-600 dark:text-slate-400 mb-12 font-medium leading-relaxed max-w-3xl mx-auto">
                Generic resumes get rejected by the filters. Paste your target Job Description below, and our LLM will analyze the gaps and dynamically rewrite your experience to highlight exactly what the recruiter wants.
              </p>

             
              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto text-left">
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-lg mb-4">1</div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Provide the Data</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Upload your base PDF and paste the JD you want to apply for.</p>
                </div>
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg mb-4">2</div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Review the Gaps</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Our engine calculates your match score and finds the missing keywords.</p>
                </div>
                <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-200 dark:border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black text-lg mb-4">3</div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">Human-in-the-Loop</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Give the AI feedback, and it will rewrite your resume perfectly.</p>
                </div>
              </div>
            </div>

           
            <div className="w-full max-w-5xl relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-[2.5rem] blur-xl opacity-20 transition-opacity duration-500"></div>
              <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
                
                <div className="grid md:grid-cols-2 gap-10">
                  
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Upload Base Resume
                      </label>
                      {file && <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> Attached</span>}
                    </div>
                    <label className="flex flex-col items-center justify-center w-full h-full min-h-[200px] border-2 border-dashed border-indigo-300 dark:border-indigo-500/50 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/50 hover:bg-indigo-100/50 transition-all cursor-pointer group">
                      <div className="flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                          <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        </div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{file ? file.name : "Drag & Drop your PDF here"}</p>
                        <p className="text-xs text-slate-500 mt-2">or click to browse files</p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} />
                    </label>
                  </div>

                
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        Target Job Description
                      </label>
                      <span className="text-xs font-medium text-slate-400">Paste full text</span>
                    </div>
                    <textarea 
                      className="w-full h-full min-h-[200px] p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-700 dark:text-slate-300 resize-none shadow-inner transition-shadow"
                      placeholder="E.g. We are looking for a Senior Frontend Engineer with 5+ years of React experience. Must have deep knowledge of Node.js..."
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={handleStartAnalysis}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-2xl font-black text-xl hover:-translate-y-1 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    Analyze Match & Build Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

       
        {(step === 'analyzing' || step === 'refixing') && (
          <div className="flex flex-col items-center justify-center py-32 w-full max-w-3xl mx-auto animate-[fadeIn_0.5s_ease-out]">
            
            <style>{`
              @keyframes scanLaser { 0% { top: -10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
              @keyframes dataFlowLeft { 0% { transform: translateX(0) scale(1); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(100px) scale(0.5); opacity: 0; } }
              @keyframes dataFlowRight { 0% { transform: translateX(0) scale(1); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateX(-100px) scale(0.5); opacity: 0; } }
            `}</style>

            <div className="flex items-center justify-between w-full max-w-lg mb-16 relative">
              
              {/* Data Flow Particles */}
              <div className="absolute top-1/2 left-1/4 right-1/4 h-1 -translate-y-1/2 flex justify-between z-0">
                <div className="w-2 h-2 bg-indigo-500 rounded-full blur-[1px]" style={{animation: 'dataFlowLeft 1s infinite linear'}}></div>
                <div className="w-2 h-2 bg-cyan-400 rounded-full blur-[1px]" style={{animation: 'dataFlowRight 1.2s infinite linear'}}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full blur-[1px]" style={{animation: 'dataFlowLeft 0.8s infinite linear 0.4s'}}></div>
              </div>

              {/* Resume Document */}
              <div className="relative z-10 w-28 h-40 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center pt-6 overflow-hidden">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <span className="text-xs font-bold text-slate-500">RESUME.PDF</span>
                <div className="absolute left-0 right-0 h-2 bg-indigo-500 shadow-[0_0_15px_3px_rgba(99,102,241,0.5)] z-10" style={{ animation: 'scanLaser 2s linear infinite' }}></div>
              </div>
              
              {/* AI Processing Core */}
              <div className="relative z-10 w-24 h-24 rounded-full bg-slate-950 border-4 border-slate-800 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.6)]">
                <div className="absolute inset-0 rounded-full border-t-4 border-cyan-400 animate-spin" style={{animationDuration: '1s'}}></div>
                <svg className="w-10 h-10 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>

              {/* JD Document */}
              <div className="relative z-10 w-28 h-40 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center pt-6 overflow-hidden">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <span className="text-xs font-bold text-slate-500">TARGET JD</span>
                <div className="absolute left-0 right-0 h-2 bg-cyan-400 shadow-[0_0_15px_3px_rgba(34,211,238,0.5)] z-10" style={{ animation: 'scanLaser 2s linear infinite 1s' }}></div>
              </div>
            </div>

            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              {step === 'refixing' ? 'Applying Context & Re-optimizing' : 'Vectorizing & Comparing'}
            </h3>
            <p className="text-indigo-600 dark:text-cyan-400 font-bold mb-10 h-6 text-lg">{scanText}</p>

            {/* Premium Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 mb-3 overflow-hidden shadow-inner p-0.5 border border-slate-300 dark:border-slate-700">
              <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-75 ease-linear relative" style={{ width: `${scanProgress}%` }}>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[progress_1s_linear_infinite]"></div>
              </div>
            </div>
            <style>{`@keyframes progress { 0% { background-position: 20px 0; } 100% { background-position: 0 0; } }`}</style>
            <span className="text-sm font-bold font-mono text-slate-500 dark:text-slate-400">{scanProgress}%</span>
          </div>
        )}

        {/* =========================================================================
            PHASE 3 & 4: PRO RESULTS DASHBOARD WITH FEEDBACK LOOP
            ========================================================================= */}
        {step === 'results' && (
          <div className="animate-[fadeIn_0.5s_ease-out] w-full pt-4 max-w-7xl mx-auto">
            
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Optimization Dashboard</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Targeting Job Description vs. <span className="text-indigo-600 dark:text-indigo-400 font-bold">{file?.name}</span></p>
              </div>
              <button onClick={() => setStep('input')} className="px-5 py-2.5 mt-4 md:mt-0 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition shadow-sm">
                Start New Analysis
              </button>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT: JD View Box */}
              <div className="lg:col-span-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-xl overflow-hidden flex flex-col max-h-[750px] sticky top-32">
                <div className="bg-slate-50 dark:bg-slate-950 px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <h3 className="font-bold text-slate-900 dark:text-white">JD Reference</h3>
                  </div>
                  <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 font-medium">Read Only</span>
                </div>
                <div className="p-6 overflow-y-auto text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed custom-scrollbar">
                  {jdText || "Company XYZ is looking for a Senior Developer...\n\nRequirements:\n- 5+ years of React\n- Node.js & PostgreSQL\n- Experience with Agile workflows."}
                </div>
              </div>

              {/* RIGHT: Data & Actions */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* Top Row: Score & Gaps */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Premium Score Card */}
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Match Probability</h3>
                    
                    <div className="relative w-40 h-40 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="6" fill="none" />
                        <circle 
                          cx="50" cy="50" r="40" 
                          className={`${matchScore > 85 ? 'stroke-green-500' : 'stroke-indigo-500'} transition-all duration-1000 ease-out`}
                          strokeWidth="6" fill="none" strokeLinecap="round" 
                          style={{ strokeDasharray: 251.2, strokeDashoffset: 251.2 - (251.2 * matchScore) / 100 }} 
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-6xl font-black font-mono text-slate-900 dark:text-white tracking-tighter">{matchScore}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm mt-1 border ${matchScore > 85 ? 'text-green-500 bg-green-500/10 border-green-500/20' : 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20'}`}>
                          {matchScore > 85 ? 'Excellent' : 'Needs Optimization'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Gaps / Findings */}
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl flex flex-col relative overflow-hidden">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2 relative z-10">
                      <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd"></path></svg>
                      Critical Gaps Found
                    </h3>
                    
                    {matchScore > 85 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-green-500 text-center relative z-10">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3 border border-green-200 dark:border-green-500/30">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white">All gaps resolved!</p>
                        <p className="text-sm text-slate-500 mt-1">Ready for ATS submission.</p>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto space-y-3 relative z-10">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Missing Hard Skills</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">Node.js, PostgreSQL</p>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5"></div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">Workflow Misalignment</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">Agile / Scrum processes</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row: Pro Action Center */}
                <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl transition-all duration-300">
                  
                  {feedbackOpen ? (
                    /* Human Feedback Input Area */
                    <div className="animate-[fadeIn_0.3s_ease-out]">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                          Provide Human Context
                        </h3>
                        <button onClick={() => setFeedbackOpen(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                          Cancel
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 font-medium">
                        Tell the AI what it missed or how to handle the gaps. Example: <span className="text-slate-900 dark:text-slate-200 italic">"I built a backend in Node.js for my capstone project, please weave that into the Education section."</span>
                      </p>
                      <textarea 
                        className="w-full h-32 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-slate-900 dark:text-slate-100 resize-none mb-6 shadow-inner font-medium"
                        placeholder="Type your feedback here..."
                        value={userFeedback}
                        onChange={(e) => setUserFeedback(e.target.value)}
                        autoFocus
                      ></textarea>
                      <button 
                        onClick={handleRefixSubmit}
                        disabled={!userFeedback.trim()}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:dark:bg-slate-800 text-white rounded-xl font-black text-lg transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd"></path></svg>
                        Apply Feedback & Generate New PDF
                      </button>
                    </div>
                  ) : (
                    /* Default Actions Box */
                    <div>
                      {matchScore > 85 ? (
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-500/20 p-6 rounded-2xl text-center mb-6">
                            <h3 className="text-xl font-black text-green-700 dark:text-green-400 mb-2">Ready for Submission</h3>
                            <p className="text-sm text-green-600 dark:text-green-500/80 font-medium">Your resume is perfectly aligned with the target JD.</p>
                          </div>
                          <button className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-lg transition-all shadow-lg shadow-green-500/30 flex items-center justify-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            Download Optimized PDF
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Optimization Required</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">How would you like to handle the missing gaps?</p>
                          
                          <div className="grid sm:grid-cols-2 gap-4">
                            <button className="py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-indigo-500/30 flex flex-col items-center justify-center gap-1">
                              <span className="flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Auto-Fix Entire Resume</span>
                              <span className="text-[10px] font-normal opacity-80">AI will invent creative contexts</span>
                            </button>
                            
                            <button 
                              onClick={() => setFeedbackOpen(true)}
                              className="py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-base transition-all shadow-sm flex flex-col items-center justify-center gap-1 group"
                            >
                              <span className="flex items-center gap-2 group-hover:text-indigo-500 transition-colors"><svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> Refix with Feedback</span>
                              <span className="text-[10px] font-normal text-slate-400">Give AI your exact experience</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}