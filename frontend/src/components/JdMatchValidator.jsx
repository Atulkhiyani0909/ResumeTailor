import { useState, useEffect } from 'react';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Show, SignIn, SignUp, SignUpButton } from '@clerk/react';

export default function JdMatchValidator() {
  const [step, setStep] = useState('input');
  const [file, setFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [matchScore, setMatchScore] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanText, setScanText] = useState('Initializing AI engine...');
  const [userFeedback, setUserFeedback] = useState('');
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [fixedResume, setFixedResume] = useState(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleStartAnalysis = async () => {
    if (!file || !jdText.trim()) return alert("Please upload a resume and paste a JD.");

    setStep('analyzing');
    setIsAILoading(true);
    setScanProgress(0);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jd_content', jdText);

      setScanText('Transmitting payload to backend...');
      const response = await axios.post('http://localhost:3000/api/jd-matcher/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log(response);


      const payload = response.data;
      const fullState = payload.response || payload.data || payload;

      setAnalysisResults(fullState);
      setMatchScore(fullState.match_score || 0);

      setIsAILoading(false);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please check your backend connection.");
      setStep('input');
      setIsAILoading(false);
    }
  };

  const handleOptimization = async (actionType) => {
    if (actionType === 'rewrite' && !userFeedback.trim()) return;

    setIsAutoFixing(actionType === 'start_tailoring');
    setStep('processing');
    setIsAILoading(true);
    setScanProgress(0);

    try {
      const response = await axios.post('http://localhost:3000/api/jd-matcher/tailor', {
        action: actionType,
        feedback: actionType === 'rewrite' ? userFeedback : null
      });

      console.log(response);

      const payload = response.data;
      const fullState = payload.response || payload.data || payload;

      setFixedResume(fullState.tailored_resume_content);

      if (fullState.match_score) {
        setMatchScore(fullState.match_score);
      }

      if (actionType === 'rewrite') {
        setUserFeedback('');
      }
      setIsAILoading(false);
    } catch (error) {
      console.error(error);
      alert(`${actionType === 'rewrite' ? 'Rewrite' : 'Auto-fix'} failed.`);
      setStep(actionType === 'rewrite' ? 'preview' : 'results');
      setIsAILoading(false);
    }
  };

  const handleAcceptAndDownload = async () => {
    setIsDownloading(true);
    try {
      // Safely tell backend we accepted, but don't block download if it fails
      await axios.post('http://localhost:3000/api/jd-matcher/tailor', { action: 'accept' }).catch(e => console.warn('Backend logging skipped', e));

      const resumePreview = document.getElementById('resume-preview');

      // Cache original styles
      const originalStyle = {
        height: resumePreview.style.height,
        maxHeight: resumePreview.style.maxHeight,
        overflow: resumePreview.style.overflow,
      };

      // Force element to full expanded height
      resumePreview.style.height = 'max-content';
      resumePreview.style.maxHeight = 'none';
      resumePreview.style.overflow = 'visible';

      // CRITICAL FIX: Wait for the browser to physically paint the DOM changes
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await toPng(resumePreview, {
        cacheBust: true,
        backgroundColor: '#FFFFFF',
        pixelRatio: 2,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });

      // Instantly restore the scrollbar view
      resumePreview.style.height = originalStyle.height;
      resumePreview.style.maxHeight = originalStyle.maxHeight;
      resumePreview.style.overflow = originalStyle.overflow;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      while (position < pdfHeight) {
        pdf.addImage(dataUrl, 'PNG', 0, position * -1, pdfWidth, pdfHeight);
        position += pageHeight;
        if (position < pdfHeight) pdf.addPage();
      }

      pdf.save(`Tailored_Resume_${file?.name?.replace('.pdf', '') || 'Optimized'}.pdf`);
    } catch (error) {
      console.error("PDF Generation Error: ", error);
      alert("Failed to finalize resume or generate PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (step === 'analyzing' || step === 'processing') {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (isAILoading && prev >= 90) return 90;
          if (!isAILoading && prev < 100) return prev + 5;
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (step === 'analyzing') setStep('results');
              else if (step === 'processing') setStep('preview');
            }, 300);
            return 100;
          }

          const newProgress = prev + 1;
          if (step === 'analyzing') {
            if (newProgress === 35) setScanText('Vectorizing resume experience data...');
            if (newProgress === 60) setScanText('Calculating AI Match Score...');
            if (newProgress === 85) setScanText('Drafting AI improvement plan...');
          } else {
            if (newProgress === 10) setScanText(isAutoFixing ? 'Auto-generating optimal contexts...' : 'Applying human feedback...');
            if (newProgress === 40) setScanText('Rewriting bullet points & injecting metrics...');
            if (newProgress === 70) setScanText('Aligning terminology with Job Description...');
            if (newProgress === 90 && isAILoading) setScanText('Waiting for LangGraph generation...');
            if (newProgress > 90 && !isAILoading) setScanText('Rendering finalized document...');
          }
          return newProgress;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step, isAILoading, isAutoFixing]);

  return (
    <div className={`relative w-full bg-[#060B19] text-slate-200 font-sans selection:bg-indigo-500/30 pt-24 ${step === 'preview' ? 'lg:h-screen lg:overflow-hidden pb-0' : 'min-h-screen overflow-x-hidden pb-20'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-400/10 blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[90rem] mx-auto px-6 lg:px-8 h-full flex flex-col">

        {step === 'input' && (
          <div className="flex flex-col items-center animate-[fadeIn_0.5s_ease-out] pt-10">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-full mb-8 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
                <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">AI Copilot Tailoring</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-white tracking-tight leading-[1.1]">
                Tailor your resume to <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">any Job Description.</span>
              </h1>
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
                    <Show when={'signed-in'}>
                      <label className="flex flex-col items-center justify-center w-full h-full min-h-[200px] border-2 border-dashed border-indigo-500/30 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center text-center p-6">
                          <div className="w-16 h-16 bg-[#161E31] rounded-2xl border border-white/5 flex items-center justify-center mb-4 group-hover:-translate-y-1 transition-transform">
                            <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                          </div>
                          <p className="text-sm font-bold text-slate-300">{file ? file.name : "Drag & Drop your PDF here"}</p>
                        </div>
                        <input type="file" className="hidden" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0])} />
                      </label>
                    </Show>
                    <Show when={'signed-out'}>
                      <label className="flex flex-col items-center justify-center w-full h-full min-h-[200px] border-2 border-dashed border-indigo-500/30 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center text-center p-6">

                          <p className="text-sm font-bold text-slate-300">Sign Up to Upload the Resume </p>
                        </div>
                        <button className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] hover:-translate-y-0.5">
                          <SignUpButton />
                        </button>
                      </label>
                    </Show>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-base font-bold text-white flex items-center gap-2 mb-3">
                      <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      Target Job Description
                    </label>
                    <textarea
                      className="w-full h-full min-h-[200px] p-5 rounded-2xl bg-[#0F1629] border border-white/10 focus:border-indigo-500/50 outline-none text-sm text-slate-300 resize-none shadow-inner transition-colors custom-scrollbar"
                      placeholder="Paste full job description text here..."
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/5">
                  <button onClick={handleStartAnalysis} disabled={isAILoading} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] flex items-center justify-center gap-3">
                    Analyze Match & Build Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {step === 'results' && analysisResults && (
          <div className="animate-[fadeIn_0.5s_ease-out] w-full max-w-[85rem] mx-auto flex flex-col gap-6">

            <div className="grid lg:grid-cols-12 gap-6">

              <div className="lg:col-span-3 bg-gradient-to-b from-[#0F1629] to-[#0A0F1D] rounded-[2rem] border border-white/5 flex flex-col items-center justify-center p-8 relative overflow-hidden shadow-2xl group hover:border-white/10 transition-all duration-500">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[50px] -mr-10 -mt-10 transition-transform group-hover:scale-125 duration-700"></div>
                <div className={`absolute bottom-0 left-0 w-40 h-40 rounded-full blur-[50px] -ml-10 -mb-10 ${matchScore >= 75 ? 'bg-emerald-500/10' : matchScore >= 50 ? 'bg-amber-500/10' : 'bg-rose-500/10'}`}></div>

                <div className="flex items-center gap-2 mb-6 z-10">
                  <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor] ${matchScore >= 75 ? 'bg-emerald-500 text-emerald-500' : matchScore >= 50 ? 'bg-amber-500 text-amber-500' : 'bg-rose-500 text-rose-500'}`}></div>
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Initial Match</h3>
                </div>

                <div className="relative w-40 h-40 flex items-center justify-center mb-6 z-10">
                  <div className={`absolute inset-0 m-auto w-24 h-24 blur-2xl rounded-full ${matchScore >= 75 ? 'bg-emerald-500/20' : matchScore >= 50 ? 'bg-amber-500/20' : 'bg-rose-500/20'}`}></div>

                  <svg className="w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" className="stroke-[#1E293B]" strokeWidth="8" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      className={`transition-all duration-[1500ms] ease-out ${matchScore >= 75 ? 'stroke-emerald-500' : matchScore >= 50 ? 'stroke-amber-500' : 'stroke-rose-500'}`}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="263.89"
                      strokeDashoffset={263.89 - (263.89 * matchScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center justify-center mt-1">
                    <div className="flex items-start">
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter">
                        {matchScore}
                      </span>
                      <span className={`text-xl font-bold mt-1 ${matchScore >= 75 ? 'text-emerald-500' : matchScore >= 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`px-4 py-1.5 rounded-full border backdrop-blur-md shadow-lg z-10 ${matchScore >= 75
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : matchScore >= 50
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {matchScore >= 75 ? 'Strong Fit' : matchScore >= 50 ? 'Average Fit' : 'Needs Optimization'}
                  </span>
                </div>
              </div>

              <div className="lg:col-span-9 grid md:grid-cols-2 gap-6">
                <div className="bg-[#0F1629] rounded-2xl border border-white/5 p-6 flex flex-col h-full">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                    Keyword Alignment
                  </h3>
                  <div className="flex flex-col gap-4 flex-1 min-h-0">
                    <div className="flex-1 bg-[#161E31]/50 rounded-xl p-4 overflow-y-auto custom-scrollbar border border-emerald-500/10">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-2 block">Direct Hits ({analysisResults.points_matched?.length || 0})</span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResults.points_matched?.map((pt, i) => (
                          <span key={i} className="text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">{pt}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 bg-[#161E31]/50 rounded-xl p-4 overflow-y-auto custom-scrollbar border border-rose-500/10">
                      <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest mb-2 block">Missing Gaps ({analysisResults.missing_points?.length || 0})</span>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResults.missing_points?.map((pt, i) => (
                          <span key={i} className="text-[11px] bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded">{pt}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="relative p-6 rounded-[2rem] border border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-[#0F1629] overflow-hidden group flex-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full transition-transform duration-700 group-hover:scale-150"></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4 border-b border-indigo-500/10 pb-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        <h3 className="text-sm font-bold text-indigo-300 tracking-wide">
                          Skills Reordering Strategy
                        </h3>
                      </div>
                      <p className="text-[13px] text-indigo-200/80 leading-relaxed font-mono bg-[#0A0F1D]/50 p-3 rounded-xl border border-white/5">
                        <span className="text-indigo-500 mr-2">❯</span>
                        {analysisResults.skills_strategy_suggestions || "No specific reordering required."}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#0F1629] rounded-[2rem] border border-white/5 p-2 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/5 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 p-3">
                      <button
                        onClick={() => handleOptimization('start_tailoring')}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold transition-all duration-300 text-sm shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                      >
                        <svg className="w-5 h-5 text-indigo-200 group-hover:animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                        Auto-Fix Everything
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0F1629] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
              <div className="bg-[#161E31] px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-md">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </div>
                <h3 className="font-bold text-white text-lg">AI Blueprint for Rewriting</h3>
                <span className="text-[11px] text-slate-400 font-medium ml-2">Applies automatically upon Auto-Fix</span>
              </div>

              <div className="p-6 grid lg:grid-cols-2 gap-8 max-h-[600px] overflow-y-auto custom-scrollbar">

                <div className="space-y-6">
                  {analysisResults.summary_suggestion && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Target: Professional Summary</h4>
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 block">Optimized AI Draft</span>
                        <p className="text-[13px] text-emerald-100/80 leading-relaxed">{analysisResults.summary_suggestion}</p>
                      </div>
                    </div>
                  )}

                  {analysisResults.improvements && analysisResults.improvements.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Structural Improvements</h4>
                      <div className="space-y-3">
                        {analysisResults.improvements.map((imp, i) => (
                          <div key={i} className="p-4 bg-[#161E31] border border-white/5 rounded-xl">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 block">Issue in {imp.section}</span>
                            <p className="text-[12px] text-slate-400 mb-3 line-through decoration-rose-500/50">{imp.original_text}</p>
                            <p className="text-[13px] text-indigo-200 leading-relaxed">{imp.suggested_rewrite}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {analysisResults.experience_suggestion && analysisResults.experience_suggestion.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Target: Work Experience</h4>
                      <div className="space-y-4">
                        {analysisResults.experience_suggestion.map((sug, i) => (
                          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 bg-[#161E31] border border-rose-500/10 rounded-lg">
                              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 block">Original</span>
                              <p className="text-[12px] text-slate-400">{sug.original_text}</p>
                            </div>
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg relative">
                              <div className="absolute top-1/2 -left-4 w-4 h-[1px] bg-emerald-500/20 hidden md:block"></div>
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 block">Rewrite Injection</span>
                              <p className="text-[12px] text-emerald-100/80 font-medium">{sug.suggested_rewrite}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analysisResults.projects_suggestions && analysisResults.projects_suggestions.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Target: Key Projects</h4>
                      <div className="space-y-4">
                        {analysisResults.projects_suggestions.map((sug, i) => (
                          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 bg-[#161E31] border border-rose-500/10 rounded-lg">
                              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2 block">Original</span>
                              <p className="text-[12px] text-slate-400">{sug.original_text}</p>
                            </div>
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg relative">
                              <div className="absolute top-1/2 -left-4 w-4 h-[1px] bg-emerald-500/20 hidden md:block"></div>
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 block">Rewrite Injection</span>
                              <p className="text-[12px] text-emerald-100/80 font-medium">{sug.suggested_rewrite}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {step === 'preview' && fixedResume && (
          <div className="animate-[fadeIn_0.5s_ease-out] w-full h-full flex flex-col">
            <div className="flex flex-col lg:flex-row gap-8 items-start flex-1 min-h-0">

              {/* Left Column - Actions */}
              <div className="w-full lg:w-[35%] flex flex-col gap-6 lg:h-full lg:overflow-y-auto custom-scrollbar pr-2 pb-10">

                {/* Score block completely removed! */}

                <div className="bg-[#0F1629] p-8 rounded-2xl border border-white/5 flex-shrink-0">
                  <div className="mb-8 border-b border-white/10 pb-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-2">Resume Finalized</h3>
                    <p className="text-sm text-slate-400">Your tailored document is ready to download.</p>
                  </div>

                  <button
                    onClick={handleAcceptAndDownload}
                    disabled={isDownloading}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 mb-8 transition-all"
                  >
                    {isDownloading ? (
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    )}
                    {isDownloading ? 'Generating PDF...' : 'Accept & Download PDF'}
                  </button>

                  <div className="border-t border-white/10 pt-8">
                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      Still missing something?
                    </h4>
                    <p className="text-xs text-slate-400 mb-5 leading-relaxed">Provide human context below and the AI will generate a new version instantly.</p>
                    <textarea
                      className="w-full h-28 p-4 rounded-xl bg-[#060B19] border border-white/10 focus:border-indigo-500/50 outline-none text-sm text-white resize-none mb-4 custom-scrollbar"
                      placeholder="e.g. 'Make the summary shorter and highlight Docker...'"
                      value={userFeedback}
                      onChange={(e) => setUserFeedback(e.target.value)}
                    ></textarea>
                    <button
                      onClick={() => handleOptimization('rewrite')}
                      disabled={!userFeedback.trim()}
                      className="w-full py-4 bg-[#161E31] hover:bg-[#1E293B] disabled:opacity-50 border border-white/5 text-white rounded-xl font-bold transition-all text-sm"
                    >
                      Refix with Feedback
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Resume PDF View */}
              <div className="w-full lg:w-[65%] lg:h-full lg:overflow-y-auto custom-scrollbar pr-2 pb-10">
                <div id="resume-preview" className="bg-white text-slate-900 p-10 md:p-14 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] min-h-[1056px] w-full max-w-[816px] mx-auto font-serif">

                  <div className="text-center border-b-2 border-slate-800 pb-5 mb-6">
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900 mb-2">Tailored Resume</h1>
                    <p className="text-sm text-slate-600 font-sans break-words whitespace-pre-wrap">{fixedResume.contact_details || "Contact info pending..."}</p>
                  </div>

                  {fixedResume.summary && (
                    <div className="mb-6">
                      <h2 className="text-[13px] font-bold border-b border-slate-300 mb-2.5 uppercase tracking-widest text-slate-800">Professional Summary</h2>
                      <p className="text-[13px] leading-relaxed text-slate-700">{fixedResume.summary}</p>
                    </div>
                  )}

                  {fixedResume.hard_skills && fixedResume.hard_skills.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-[13px] font-bold border-b border-slate-300 mb-2.5 uppercase tracking-widest text-slate-800">Core Competencies</h2>
                      <div className="flex flex-wrap gap-1.5">
                        {fixedResume.hard_skills.map((skill, i) => (
                          <span key={i} className="text-[12px] bg-slate-100 font-sans font-semibold text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {fixedResume.experience && fixedResume.experience.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-[13px] font-bold border-b border-slate-300 mb-3.5 uppercase tracking-widest text-slate-800">Work Experience</h2>
                      {fixedResume.experience.map((exp, i) => (
                        <div key={i} className="mb-5">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="text-[14px] font-bold text-slate-900">{exp.role}</h3>
                            <span className="text-[12px] font-semibold text-slate-600 font-sans whitespace-nowrap">
                              {exp.period || (exp.is_current ? 'Present' : '')}
                            </span>
                          </div>
                          <div className="text-[13px] text-slate-600 italic mb-2">{exp.company}</div>
                          <ul className="list-disc ml-5 space-y-1.5 text-[13px] text-slate-700 leading-relaxed">
                            {exp.bullets?.map((b, j) => (
                              <li key={j} className="pl-1">{b.text}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {fixedResume.projects && fixedResume.projects.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-[13px] font-bold border-b border-slate-300 mb-3.5 uppercase tracking-widest text-slate-800">Key Projects</h2>
                      {fixedResume.projects.map((proj, i) => (
                        <div key={i} className="mb-5">
                          <div className="flex items-baseline gap-2 mb-1">
                            <h3 className="text-[14px] font-bold text-slate-900">{proj.name}</h3>
                            <span className="text-[12px] text-slate-500 font-sans italic">| {proj.type_of_project}</span>
                          </div>
                          <p className="text-[13px] text-slate-700 mb-2 leading-relaxed">{proj.description}</p>
                          <ul className="list-disc ml-5 space-y-1.5 text-[13px] text-slate-700 leading-relaxed">
                            {proj.key_achievements?.map((achieve, j) => (
                              <li key={j} className="pl-1">{achieve}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}

                  {fixedResume.education_details && fixedResume.education_details.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-[13px] font-bold border-b border-slate-300 mb-3.5 uppercase tracking-widest text-slate-800">Education</h2>
                      <ul className="list-disc ml-5 space-y-1.5 text-[13px] text-slate-700 leading-relaxed">
                        {fixedResume.education_details.map((edu, i) => (
                          <li key={i} className="pl-1">{edu}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}