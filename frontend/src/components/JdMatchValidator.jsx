import { useState, useEffect } from 'react';

export default function JdMatchValidator() {
  const [step, setStep] = useState('input'); // input, analyzing, results, processing, preview
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  
  // Dashboard State
  const [matchScore, setMatchScore] = useState(62);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanText, setScanText] = useState('Initializing AI engine...');
  const [userFeedback, setUserFeedback] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);

  // Mock Fixed Data for Preview (Simulating AI JSON Output)
  const [fixedResume, setFixedResume] = useState({
    name: "Atul Khiyani",
    title: "Full Stack Developer",
    summary: "Dynamic Software Engineer with a focus on scalable backend architectures. Expert in Node.js and PostgreSQL, delivering high-performance solutions in Agile environments.",
    skills: ["React", "Node.js", "PostgreSQL", "Tailwind CSS", "AWS S3", "Agile/Scrum"],
    experience: [
      {
        company: "Apaxion Technology",
        role: "Software Engineer Intern",
        period: "Oct 2025 - Present",
        bullets: [
          "Architected backend services using Node.js and PostgreSQL, improving query efficiency by 40%.",
          "Spearheaded Agile sprint planning and daily standups for a cross-functional team.",
          "Integrated AWS S3 buckets for secure and scalable media storage."
        ]
      }
    ]
  });

  // Dual-purpose Loading Effect (Initial Analysis AND Resume Generation)
  useEffect(() => {
    if (step === 'analyzing' || step === 'processing') {
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (step === 'analyzing') {
                setStep('results');
              } else if (step === 'processing') {
                setStep('preview');
                setMatchScore(isAutoFixing ? 95 : 98); // Boost score after fix
              }
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
            if (newProgress === 10) setScanText(isAutoFixing ? 'Auto-generating optimal contexts...' : 'Applying human feedback...');
            if (newProgress === 40) setScanText('Rewriting bullet points & injecting keywords...');
            if (newProgress === 70) setScanText('Recalculating ATS match probability...');
            if (newProgress === 90) setScanText('Rendering finalized document...');
          }

          return newProgress;
        });
      }, 40); 
      return () => clearInterval(interval);
    }
  }, [step, isAutoFixing]);

  const handleStartAnalysis = () => {
    if (!file || !jdText.trim()) return alert("Please upload a resume and paste a JD.");
    setStep('analyzing');
    setMatchScore(62); 
  };

  const handleAutoFix = () => {
    setIsAutoFixing(true);
    setStep('processing');
  };

  const handleRefixSubmit = () => {
    if (!userFeedback.trim()) return;
    setIsAutoFixing(false);
    setStep('processing');
  };

  return (
    <div className="relative w-full min-h-screen pt-24 pb-20 bg-[#060B19] text-slate-200 overflow-x-hidden font-sans">
      
      {/* Background Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">

        {/* =========================================================================
            PHASE 1: INPUT SCREEN
            ========================================================================= */}
        {step === 'input' && (
          <div className="flex flex-col items-center animate-[fadeIn_0.5s_ease-out] pt-10">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-8 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
                <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">AI Copilot Tailoring</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white tracking-tight leading-[1.1]">
                Tailor your resume to <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">any Job Description.</span>
              </h1>
              <p className="text-lg text-slate-400 mb-12 font-medium leading-relaxed max-w-3xl mx-auto">
                Generic resumes get rejected by filters. Paste your target Job Description below, and our LLM will analyze the gaps and dynamically rewrite your experience to highlight exactly what the recruiter wants.
              </p>
            </div>

            <div className="w-full max-w-5xl relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-[2.5rem] blur-xl opacity-20 transition-opacity duration-500"></div>
              <div className="relative bg-[#0B1121] border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
                
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="flex flex-col">
                    <label className="text-base font-bold text-white flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      Upload Base Resume
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-full min-h-[200px] border-2 border-dashed border-indigo-500/30 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 transition-all cursor-pointer group">
                      <div className="flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 bg-[#161E31] rounded-2xl border border-white/5 flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                          <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        </div>
                        <p className="text-sm font-bold text-slate-300">{file ? file.name : "Drag & Drop your PDF here"}</p>
                      </div>
                      <input type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} />
                    </label>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-base font-bold text-white flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      Target Job Description
                    </label>
                    <textarea 
                      className="w-full h-full min-h-[200px] p-5 rounded-2xl bg-[#0F1629] border border-white/10 focus:border-indigo-500/50 outline-none text-sm text-slate-300 resize-none shadow-inner transition-colors"
                      placeholder="Paste full job description text here..."
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <button 
                    onClick={handleStartAnalysis}
                    className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-3"
                  >
                    Analyze Match & Build Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PHASE 2: LOADING SCREEN
            ========================================================================= */}
        {(step === 'analyzing' || step === 'processing') && (
          <div className="flex flex-col items-center justify-center py-32 w-full max-w-2xl mx-auto animate-[fadeIn_0.5s_ease-out]">
            <div className="relative w-24 h-24 mb-10">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              <svg className="absolute inset-0 m-auto w-10 h-10 text-indigo-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-2xl font-black text-white mb-8 text-center">{scanText}</h3>
            <div className="w-full bg-[#0F1629] rounded-full h-3 mb-3 overflow-hidden border border-white/5">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-75 ease-linear" style={{ width: `${scanProgress}%` }}></div>
            </div>
            <span className="text-sm font-bold font-mono text-slate-500">{scanProgress}%</span>
          </div>
        )}

        {/* =========================================================================
            PHASE 3: RESULTS DASHBOARD (Matches Screenshot)
            ========================================================================= */}
        {step === 'results' && (
          <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-6xl mx-auto">
            
            <div className="grid lg:grid-cols-3 gap-6 items-stretch">
              
              {/* Box 1: JD Reference */}
              <div className="lg:col-span-1 bg-[#0F1629] rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[320px]">
                <div className="bg-[#161E31] px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    JD Reference
                  </h3>
                  <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold uppercase tracking-widest">Read Only</span>
                </div>
                <div className="p-5 overflow-y-auto text-sm text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {jdText || "Software Engineer Requirements...\n- Node.js & PostgreSQL\n- Experience with Agile workflows."}
                </div>
              </div>

              {/* Box 2: Match Probability */}
              <div className="lg:col-span-1 bg-[#0F1629] rounded-2xl border border-white/5 flex flex-col items-center justify-center p-8 relative overflow-hidden h-[320px]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-bl-full -mr-10 -mt-10"></div>
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-8">Match Probability</h3>
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" className="stroke-[#1E293B]" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="42" className="stroke-indigo-500" strokeWidth="8" fill="none" strokeDasharray="263.89" strokeDashoffset={263.89 - (263.89 * matchScore) / 100} strokeLinecap="round" />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-white">{matchScore}</span>
                  </div>
                </div>
                <span className="absolute bottom-10 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm border text-indigo-400 bg-indigo-500/10 border-indigo-500/20 z-10">
                  Needs Optimization
                </span>
              </div>

              {/* Box 3: Critical Gaps */}
              <div className="lg:col-span-1 bg-[#0F1629] rounded-2xl border border-white/5 p-6 flex flex-col h-[320px]">
                <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd"></path></svg>
                  Critical Gaps Found
                </h3>
                <div className="space-y-4 overflow-y-auto pr-1">
                  <div className="p-4 rounded-xl bg-[#161E31] border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                      <p className="text-xs font-bold text-white">Missing Hard Skills</p>
                    </div>
                    <p className="text-xs text-slate-400 font-mono ml-4">Node.js, PostgreSQL</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#161E31] border border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                      <p className="text-xs font-bold text-white">Workflow Misalignment</p>
                    </div>
                    <p className="text-xs text-slate-400 font-mono ml-4">Agile / Scrum processes</p>
                  </div>
                </div>
              </div>

              {/* Bottom Box: Optimization Action Center */}
              <div className="lg:col-span-3 bg-[#0F1629] rounded-2xl border border-white/5 p-8 mt-2 transition-all duration-300">
                {!feedbackOpen ? (
                  <div>
                    <h3 className="text-2xl font-black text-white mb-2">Optimization Required</h3>
                    <p className="text-sm text-slate-400 mb-6">How would you like to handle the missing gaps?</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <button 
                        onClick={handleAutoFix}
                        className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1 shadow-lg shadow-indigo-600/20"
                      >
                        <span className="flex items-center gap-2 text-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> Auto-Fix Entire Resume</span>
                        <span className="text-[11px] font-normal text-indigo-200">AI will invent creative contexts</span>
                      </button>
                      <button 
                        onClick={() => setFeedbackOpen(true)}
                        className="w-full py-5 bg-[#161E31] hover:bg-[#1E293B] border border-white/5 text-white rounded-xl font-bold transition-all flex flex-col items-center justify-center gap-1"
                      >
                        <span className="flex items-center gap-2 text-lg"><svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg> Refix with Feedback</span>
                        <span className="text-[11px] font-normal text-slate-400">Give AI your exact experience</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="animate-[fadeIn_0.3s_ease-out]">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black text-white">Provide Human Context</h3>
                      <button onClick={() => setFeedbackOpen(false)} className="text-xs text-slate-400 hover:text-white font-bold">Cancel</button>
                    </div>
                    <textarea 
                      className="w-full h-24 p-4 rounded-xl bg-[#060B19] border border-white/10 focus:border-indigo-500/50 outline-none text-sm text-white resize-none mb-4"
                      placeholder="E.g., 'I built a backend in Node.js for my capstone project, please weave that in...'"
                      value={userFeedback}
                      onChange={(e) => setUserFeedback(e.target.value)}
                      autoFocus
                    ></textarea>
                    <button 
                      onClick={handleRefixSubmit}
                      disabled={!userFeedback.trim()}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all"
                    >
                      Apply Feedback & Re-Optimize
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            PHASE 4: PREVIEW DASHBOARD (Pro Split-Screen)
            ========================================================================= */}
        {step === 'preview' && (
          <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Actions & Feedback Loop */}
              <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
                
                {/* Success Card */}
                <div className="bg-[#0F1629] p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl font-black text-green-400">{matchScore}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Highly Optimized</h3>
                  <p className="text-sm text-slate-400">Your resume is ready to bypass the ATS.</p>
                </div>

                {/* Primary Action */}
                <div className="bg-[#0F1629] p-6 rounded-2xl border border-white/5">
                  <button className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 mb-6 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Accept & Download PDF
                  </button>

                  <div className="border-t border-white/10 pt-6">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      Want to tweak it?
                    </h4>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">Provide additional feedback below and the AI will generate a new version instantly.</p>
                    <textarea 
                      className="w-full h-24 p-3 rounded-xl bg-[#060B19] border border-white/10 focus:border-indigo-500/50 outline-none text-sm text-white resize-none mb-3"
                      placeholder="e.g. 'Make the summary sound more professional...'"
                      value={userFeedback}
                      onChange={(e) => setUserFeedback(e.target.value)}
                    ></textarea>
                    <button 
                      onClick={handleRefixSubmit}
                      disabled={!userFeedback.trim()}
                      className="w-full py-3 bg-[#161E31] hover:bg-[#1E293B] disabled:opacity-50 border border-white/5 text-white rounded-xl font-bold transition-all text-sm"
                    >
                      Refix with Feedback
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Resume Preview (Paper Style) */}
              <div className="lg:col-span-8">
                <div className="bg-white text-slate-900 p-10 md:p-14 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] min-h-[850px] font-serif">
                  
                  {/* Resume Header */}
                  <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900">{fixedResume.name}</h1>
                    <p className="text-sm mt-2 text-slate-600 font-sans">{fixedResume.title} | Bhopal, India | +91 000000000</p>
                  </div>

                  {/* Summary */}
                  <div className="mb-8">
                    <h2 className="text-sm font-bold border-b border-slate-300 mb-3 uppercase tracking-widest text-slate-800">Professional Summary</h2>
                    <p className="text-[14px] leading-relaxed text-slate-700">{fixedResume.summary}</p>
                  </div>

                  {/* Skills */}
                  <div className="mb-8">
                    <h2 className="text-sm font-bold border-b border-slate-300 mb-3 uppercase tracking-widest text-slate-800">Core Competencies</h2>
                    <div className="flex flex-wrap gap-2">
                      {fixedResume.skills.map(skill => (
                        <span key={skill} className="text-[13px] bg-slate-100 font-sans font-semibold text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <h2 className="text-sm font-bold border-b border-slate-300 mb-4 uppercase tracking-widest text-slate-800">Work Experience</h2>
                    {fixedResume.experience.map((exp, i) => (
                      <div key={i} className="mb-6">
                        <div className="flex justify-between items-baseline mb-2">
                          <h3 className="text-[15px] font-bold text-slate-900">{exp.role}</h3>
                          <span className="text-[13px] font-bold text-slate-600 font-sans">{exp.period}</span>
                        </div>
                        <div className="text-[14px] text-slate-600 italic mb-2">{exp.company}</div>
                        <ul className="list-disc ml-5 space-y-1.5 text-[14px] text-slate-700 leading-relaxed">
                          {exp.bullets.map((b, j) => (
                            <li key={j} className="pl-1">
                              {/* Highlight keywords artificially for preview context */}
                              {b.replace(/(Node\.js|PostgreSQL|Agile|AWS S3)/g, '||$1||').split('||').map((part, idx) => 
                                ['Node.js', 'PostgreSQL', 'Agile', 'AWS S3'].includes(part) 
                                ? <span key={idx} className="bg-indigo-100 text-indigo-800 font-semibold px-1 rounded">{part}</span> 
                                : part
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
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