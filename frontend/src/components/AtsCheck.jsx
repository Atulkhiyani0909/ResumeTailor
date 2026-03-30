import { useState, useEffect } from 'react';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Show, SignUpButton, useAuth } from '@clerk/react';
import { ResumeDocument } from './ResumeDocument';
import { CollapsibleSection } from './CollapsiableSection';

export default function AtsChecker() {

  const { getToken, isSignedIn } = useAuth();

  const [file, setFile] = useState(null);
  const [scanState, setScanState] = useState('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [atsResults, setAtsResults] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [tailorState, setTailorState] = useState('idle');
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [newScore, setNewScore] = useState(0);
  
 
  const [hasSavedResume, setHasSavedResume] = useState(false);


  useEffect(() => {
    const savedData = localStorage.getItem('atsScanHistory');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setAtsResults(parsed.results);
        setFile({ name: parsed.fileName });
        if (parsed.tailoredResume) {
          setTailoredResume(parsed.tailoredResume);
          setNewScore(parsed.newScore);
          setTailorState(parsed.tailorState);
        }
        setScanState('complete');
      } catch (e) {
        console.error("Failed to load local storage", e);
      }
    }
  }, []);


  useEffect(() => {
    async function checkSavedResume() {
      if (isSignedIn) {
        try {
          const token = await getToken();
          const res = await axios.get('http://localhost:3000/api/users/profile', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data?.success && res.data.user?.resumeUrl) {
            setHasSavedResume(true);
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      }
    }
    checkSavedResume();
  }, [isSignedIn, getToken]);

 
  const executeScan = async (uploadedFile = null) => {
   
    setFile(uploadedFile || { name: 'Saved Profile Resume' }); 
    setScanState('scanning');
    setScanProgress(0);
    setTerminalLogs(['[SYSTEM] Initializing secure environment...']);
    setAtsResults(null);
    setTailorState('idle');
    setTailoredResume(null);

    try {
      const token = await getToken();
      setTerminalLogs(prev => [...prev, '[NETWORK] Transmitting encrypted payload to server...'].slice(-5));
      
      const formData = new FormData();
      if (uploadedFile) {
        formData.append('resume', uploadedFile);
      }

      const response = await axios.post('http://localhost:3000/api/ats/analyze-resume', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });

      const results = response.data?.ats_data?.response || response.data;
      
      setTerminalLogs(prev => [...prev, '[SYSTEM] Analysis complete. Rendering results...'].slice(-5));
      setAtsResults(results);

      localStorage.setItem('atsScanHistory', JSON.stringify({
        fileName: uploadedFile?.name || 'Saved Profile Resume',
        results: results
      }));

    } catch (error) {
      setTerminalLogs(prev => [...prev, '[ERROR] Pipeline failure. Please try again.'].slice(-5));
      setTimeout(() => setScanState('idle'), 3000);
    }
  };

  const handleUpload = (e) => {
    const uploadedFile = e.target.files[0] || e.dataTransfer?.files[0];
    if (uploadedFile) {
      executeScan(uploadedFile);
    }
    if (e.target) e.target.value = null; 
  };

  const handleTailorAction = async (choice) => {
    setIsTailoring(true);
    try {
      const token = await getToken(); 
      
      const response = await axios.post('http://localhost:3000/api/ats/tailor-resume', 
        { user_choice: choice },
      );
      
      if (!choice) {
        setTailorState('declined');
        setIsTailoring(false);
        return;
      }

      const serverPayload = response.data?.data || response.data; 
      const atsResponse = serverPayload?.tailored_resume?.response || serverPayload?.response || serverPayload;
      
      const finalResumeData = atsResponse?.tailored_resume || atsResponse?.final_resume_tailored;
      const finalScoreData = atsResponse?.final_score || 0;

      if (finalResumeData) {
        setTailoredResume(finalResumeData);
        setNewScore(finalScoreData);
        setTailorState('tailored');
        
        localStorage.setItem('atsScanHistory', JSON.stringify({
          fileName: file?.name || 'Resume.pdf',
          results: atsResults,
          tailoredResume: finalResumeData,
          newScore: finalScoreData,
          tailorState: 'tailored'
        }));
      } else {
        console.error("Could not extract tailored resume from response:", response.data);
      }
    } catch (err) {
      console.error("Tailoring failed", err);
    } finally {
      setIsTailoring(false);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    handleUpload(e);
  };

  useEffect(() => {
    if (scanState === 'scanning') {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (!atsResults && prev >= 90) return 90;
          if (atsResults && prev < 100) return prev + 2;
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setScanState('complete'), 400);
            return 100;
          }

          const newProgress = prev + 1;
          const logs = [...terminalLogs];
          if (newProgress === 10) logs.push('[PARSER] Extracting text nodes and metadata...');
          if (newProgress === 35) logs.push('[AI] Running heuristic layout analysis...');
          if (newProgress === 60) logs.push('[VECTOR] Cross-referencing industry keywords...');
          if (newProgress === 85 && !atsResults) logs.push('[NETWORK] Waiting for AI model response...');
          if (logs.length > terminalLogs.length) setTerminalLogs(logs.slice(-5));

          return newProgress;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [scanState, atsResults, terminalLogs]);

  const resetScanner = () => {
    localStorage.removeItem('atsScanHistory');
    setFile(null);
    setAtsResults(null);
    setScanState('idle');
    setScanProgress(0);
    setTerminalLogs([]);
    setShowRaw(false);
    setTailoredResume(null);
    setTailorState('idle');
  };

  const downloadReport = async () => {
    setIsDownloading(true);
    const reportContainer = document.getElementById('report-container');
    await new Promise(resolve => setTimeout(resolve, 300)); 

    try {
      const dataUrl = await toPng(reportContainer, {
        cacheBust: true,
        backgroundColor: '#0B0F19',
        pixelRatio: 2,
        filter: (node) => {
          return node.getAttribute?.('data-html2canvas-ignore') !== 'true';
        }
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position -= pdfPageHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfPageHeight;
      }

      pdf.save(`ResumeTailor_Report_${file?.name?.replace('.pdf', '') || 'Resume'}.pdf`);
    } catch (err) {
      console.error("PDF Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadTailoredResume = async () => {
    setIsDownloading(true);
    const resumePreview = document.getElementById('resume-preview');
    await new Promise((resolve) => setTimeout(resolve, 300)); 
    
    try {
      const dataUrl = await toPng(resumePreview, {
        cacheBust: true,
        backgroundColor: '#FFFFFF',
        pixelRatio: 2,
        style: { transform: 'scale(1)', transformOrigin: 'top left' }
      });
      
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
      console.error("Tailored PDF Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const score = atsResults?.final_score || 0;
  const breakdown = atsResults?.score_breakdown || {};
  const missingKeywords = atsResults?.missing_keywords || [];
  const suggestions = atsResults?.suggestions || [];
  const semanticErrors = atsResults?.semantic_error || [];
  const parsedData = atsResults?.parsed_resume_structured || {};
  const rawText = atsResults?.resume_content_raw || '';

  let scoreColor = "text-rose-500";
  let scoreLabel = "High Risk";
  let scoreGradStart = "#f43f5e";

  if (score >= 60) {
    scoreColor = "text-amber-500";
    scoreLabel = "Average";
    scoreGradStart = "#f59e0b";
  }
  if (score >= 80) {
    scoreColor = "text-emerald-500";
    scoreLabel = "Excellent";
    scoreGradStart = "#10b981";
  }

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * score) / 100;

  const formatKey = (key) => key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div id="main-wrapper" className="relative w-full bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 pt-16 min-h-screen overflow-x-hidden pb-24">

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" data-html2canvas-ignore="true">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-[95rem] mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">

        {scanState === 'idle' && (
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-between animate-[fadeIn_0.5s_ease-out] pt-12 lg:pt-20">
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 px-4 py-2 rounded-full mb-8 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">Enterprise ATS Scanner</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-[1.1]">
                Beat the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">Bots.</span> <br />
                Land the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Interview.</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-10 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                Upload your resume to instantly reveal hidden formatting errors, missing keywords, and structural flaws that cause ATS rejections.
              </p>
            </div>

            <div className="w-full lg:w-1/2 max-w-md mx-auto relative group" onDragOver={handleDragOver} onDrop={handleDrop}>
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500 to-cyan-400 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
              <div className="relative bg-white dark:bg-[#111827]/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 mb-6 rounded-2xl bg-indigo-50 dark:bg-[#1f2937] shadow-inner border border-indigo-100 dark:border-slate-700 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-300">
                  <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                </div>
                <h3 className="text-xl font-black mb-2">Upload Resume</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-8">PDF or DOCX up to 2MB</p>
                
                <Show when={'signed-in'}>
                  {/* 5. Dynamically show 'Use Saved' button if they have one */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-center items-center">
                    {hasSavedResume && (
                      <button 
                        onClick={() => executeScan(null)}
                        className="w-full py-3.5 px-4 bg-slate-800 hover:bg-slate-700 border border-indigo-500/30 text-white rounded-xl font-bold text-sm transition-all shadow-lg flex justify-center items-center gap-2 whitespace-nowrap"
                      >
                        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        Use Saved Resume
                      </button>
                    )}
                    <label className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-sm cursor-pointer transition-colors shadow-lg flex justify-center items-center gap-2 whitespace-nowrap">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                      {hasSavedResume ? "Upload New" : "Browse Files"}
                      <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleUpload} />
                    </label>
                  </div>
                </Show>

                <Show when={'signed-out'}>
                  <h2 className="font-bold text-slate-300">Sign Up to Upload the Resume</h2>
                  <br />
                  <label className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-sm cursor-pointer transition-colors shadow-lg flex justify-center items-center gap-2">
                    <SignUpButton />
                    <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleUpload} />
                  </label>
                </Show>
                <p className="mt-5 text-[10px] font-semibold text-slate-400">Strictly confidential. No data is stored.</p>
              </div>
            </div>
          </div>
        )}

        {scanState === 'scanning' && (
          <div className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto animate-[fadeIn_0.5s_ease-out] pt-32">
            <div className="w-full bg-[#0d1117] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden mb-6">
              <div className="bg-[#161b22] border-b border-slate-800 px-4 py-2.5 flex items-center justify-between">
                <div className="flex space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-[10px] font-mono text-slate-500">ats-core-engine.sh</div>
              </div>
              <div className="p-5 h-64 font-mono text-xs overflow-hidden relative flex flex-col justify-end">
                <div className="relative z-10 flex flex-col space-y-3">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className={`${i === terminalLogs.length - 1 ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                      <span className="opacity-50 mr-2">{'>'}</span>{log}
                    </div>
                  ))}
                  <div className="text-slate-500 animate-pulse"><span className="opacity-50 mr-2">{'>'}</span>_</div>
                </div>
              </div>
            </div>
            <div className="w-full px-2">
              <div className="flex justify-between text-xs font-bold font-mono mb-2">
                <span className="text-indigo-400 tracking-widest">
                  {scanProgress < 90 ? 'ANALYZING DOCUMENT...' : 'WAITING FOR AI RESPONSE...'}
                </span>
                <span className="text-slate-500">{scanProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-100 ease-linear bg-indigo-500" style={{ width: `${scanProgress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* --- INITIAL ATS RESULTS DISPLAY --- */}
        {scanState === 'complete' && atsResults && tailorState !== 'tailored' && (
          <div id="report-container" className="animate-[fadeIn_0.5s_ease-out] w-full pt-7 flex flex-col bg-[#0B0F19]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 border-b border-slate-200 dark:border-slate-800/60 pb-5 px-2">
              <div>
                <h1 className="text-indigo-400 font-black tracking-widest text-xs uppercase mb-2 bg-indigo-500/10 inline-block px-2.5 py-1 rounded">ResumeTailor.AI</h1>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1 text-white">Audit Report</h2>
                <p className="text-slate-400 font-medium flex items-center gap-1.5 text-sm break-all">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  {file?.name || 'Resume.pdf'}
                </p>
              </div>
              <div className="flex gap-3 w-full sm:w-auto" data-html2canvas-ignore="true">
                <button onClick={downloadReport} disabled={isDownloading} className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2">
                  {isDownloading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Generating...
                    </>
                  ) : 'Download PDF'}
                </button>
                <button onClick={resetScanner} className="flex-1 sm:flex-none px-5 py-2.5 bg-[#1f2937] hover:bg-[#374151] text-white border border-slate-700 rounded-lg text-sm font-bold transition-all shadow-sm">
                  New Scan
                </button>
              </div>
            </div>

            <div id="panels-wrapper" className="flex flex-col lg:flex-row gap-8 items-start w-full pb-4">
              <div id="left-panel" className="w-full lg:w-[35%] flex flex-col gap-6 px-2 pb-10">
                <div className="bg-[#111827] p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center justify-center flex-shrink-0">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Match Probability</h3>
                  <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                    <svg className="w-full h-full transform -rotate-90 drop-shadow-xl" viewBox="0 0 130 130">
                      <circle cx="65" cy="65" r={radius} className="stroke-slate-800/60" strokeWidth="8" fill="none" />
                      <circle cx="65" cy="65" r={radius} stroke={scoreGradStart} strokeWidth="8" fill="none" strokeLinecap="round" style={{ strokeDasharray: circumference, strokeDashoffset: strokeDashoffset }} className="transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center mt-1">
                      <span className="text-6xl font-black font-mono tracking-tighter text-white">{score}</span>
                      <span className={`text-[10px] font-bold ${scoreColor} uppercase tracking-widest px-2.5 py-0.5 rounded border border-current mt-2`}>{scoreLabel}</span>
                    </div>
                  </div>
                  <div className="w-full space-y-4">
                    {Object.entries(breakdown).map(([key, val]) => (
                      <div key={key} className="w-full">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-400">{formatKey(key)}</span>
                          <span className="text-slate-200">{val}/100</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${val >= 80 ? 'bg-emerald-500' : val >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-xl flex flex-col flex-shrink-0">
                  <div className="bg-slate-800/30 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-white">Parser Extraction</h3>
                  </div>
                  <div className="p-6 space-y-6 text-sm">
                    {parsedData.contact_details && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contact Details</span>
                        <p className="text-slate-300 font-mono text-xs break-words bg-slate-900 p-3 rounded-lg border border-slate-800/50">{parsedData.contact_details}</p>
                      </div>
                    )}
                    {parsedData.summary && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Professional Summary</span>
                        <p className="text-slate-300 text-sm leading-relaxed">{parsedData.summary}</p>
                      </div>
                    )}
                    {parsedData.hard_skills?.length > 0 && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Hard Skills</span>
                        <div className="flex flex-wrap gap-2">
                          {parsedData.hard_skills.map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 rounded text-xs font-semibold border border-indigo-500/20">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {parsedData.experience?.length > 0 && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Experience</span>
                        <div className="space-y-3">
                          {parsedData.experience.map((exp, i) => (
                            <div key={i} className="bg-slate-900 p-3.5 rounded-lg border border-slate-800/50">
                              <p className="font-bold text-sm text-white">{exp.role}</p>
                              <p className="text-xs text-slate-400 mb-2">{exp.company} {exp.is_current ? '(Current)' : ''}</p>
                              <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-300">
                                {exp.bullets?.map((b, idx) => <li key={idx}>{b.text}</li>)}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {parsedData.projects?.length > 0 && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Projects</span>
                        <div className="space-y-3">
                          {parsedData.projects.map((proj, i) => (
                            <div key={i} className="bg-slate-900 p-3.5 rounded-lg border border-slate-800/50">
                              <p className="font-bold text-sm text-white">{proj.name}</p>
                              <p className="text-xs text-slate-400 mb-2">{proj.type_of_project}</p>
                              <p className="text-xs text-slate-300 line-clamp-2">{proj.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {parsedData.education_details?.length > 0 && (
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Education</span>
                        <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-300">
                          {parsedData.education_details.map((edu, i) => <li key={i}>{edu}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowRaw(!showRaw)} data-html2canvas-ignore="true" className="w-full p-4 bg-slate-800/50 hover:bg-slate-800 border-t border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mt-auto">
                    {showRaw ? 'Hide Raw Text' : 'View Raw Document'}
                    <svg className={`w-4 h-4 transform transition-transform ${showRaw ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </button>
                  {showRaw && (
                    <div className="p-6 bg-[#0d1117] border-t border-slate-800">
                      <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap break-words overflow-visible leading-relaxed">{rawText}</pre>
                    </div>
                  )}
                </div>
              </div>

              <div id="right-panel" className="w-full lg:w-[65%] flex flex-col gap-6 px-2 pb-10">
                {tailorState !== 'declined' && (
                  <div className="bg-gradient-to-br from-indigo-900/40 to-[#111827] rounded-2xl border border-indigo-500/30 p-8 shadow-xl relative overflow-hidden flex-shrink-0" data-html2canvas-ignore="true">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-[50px]"></div>
                    <h3 className="text-xl font-black text-white mb-2">Optimize My Resume</h3>
                    <p className="text-sm text-slate-400 mb-6">Let our AI automatically fix the semantic errors, inject missing keywords, and rewrite weak bullet points to boost your ATS score.</p>
                    <div className="flex gap-4">
                      <button onClick={() => handleTailorAction(true)} disabled={isTailoring} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2">
                        {isTailoring ? (
                          <><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Optimizing...</>
                        ) : 'Tailor My Resume'}
                      </button>
                      <button onClick={() => handleTailorAction(false)} disabled={isTailoring} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm transition-all">
                        No, it's final
                      </button>
                    </div>
                  </div>
                )}

                {missingKeywords.length > 0 && (
                  <div className="bg-[#111827] rounded-2xl border border-rose-900/30 shadow-xl overflow-hidden relative flex-shrink-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                    <div className="p-6 sm:p-8">
                      <h3 className="text-xl font-black text-white mb-3 flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 text-rose-400 rounded-md">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        Missing Core Keywords
                      </h3>
                      <p className="text-sm text-slate-400 font-medium mb-6 lg:ml-12">ATS algorithms specifically scan for these terms based on your implied role.</p>
                      <div className="flex flex-wrap gap-2.5 lg:ml-12">
                        {missingKeywords.map((kw, i) => (
                          <span key={i} className="px-4 py-2 bg-rose-500/5 text-rose-300 rounded-md text-sm font-semibold border border-rose-500/20">+ {kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative flex-shrink-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                    <div className="p-6 sm:p-8 border-b border-slate-800/60">
                      <h3 className="text-xl font-black text-white mb-3 flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-md">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                        </div>
                        Impact & Metrics Analysis
                      </h3>
                      <p className="text-sm text-slate-400 font-medium lg:ml-12">Recruiters and semantic ATS engines prioritize quantifiable results over passive responsibilities.</p>
                    </div>
                    <div className="divide-y divide-slate-800/60 bg-transparent">
                      {suggestions.map((sug, i) => (
                        <div key={i} className="p-6 sm:p-8">
                          <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs font-bold uppercase tracking-widest mb-4">Target: {sug.section}</span>
                          <div className="grid lg:grid-cols-2 gap-5">
                            <div className="p-5 bg-slate-900/50 rounded-xl border border-rose-900/20">
                              <span className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-widest mb-3">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                Current Phrasing
                              </span>
                              <p className="text-slate-400 text-sm leading-relaxed">{sug.original_text}</p>
                            </div>
                            <div className="p-5 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
                              <span className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                Optimized Structure
                              </span>
                              <p className="text-slate-200 text-sm leading-relaxed font-medium">{sug.suggested_rewrite}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {semanticErrors.length > 0 && (
                  <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative flex-shrink-0">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                    <div className="p-6 sm:p-8 border-b border-slate-800/60">
                      <h3 className="text-xl font-black text-white mb-3 flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-md">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </div>
                        Formatting & Tone Flaws
                      </h3>
                      <p className="text-sm text-slate-400 font-medium lg:ml-12">Detected weak action verbs, personal pronouns, or buzzwords that penalize your score.</p>
                    </div>
                    <div className="divide-y divide-slate-800/60">
                      {semanticErrors.map((err, i) => (
                        <div key={i} className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                          <div className="flex-1 w-full">
                            <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Issue in {err.section}</span>
                            <p className="text-sm text-slate-400 line-through decoration-rose-500/50 leading-relaxed">{err.original_text}</p>
                          </div>
                          <div className="hidden sm:block text-slate-700 flex-shrink-0">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                          </div>
                          <div className="flex-1 w-full bg-amber-500/5 p-5 rounded-xl border border-amber-500/10">
                            <p className="text-sm font-medium text-amber-100 leading-relaxed">{err.suggested_rewrite}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAILORED RESUME DISPLAY --- */}
        {scanState === 'complete' && atsResults && tailorState === 'tailored' && (
          <div id="report-container" className="animate-[fadeIn_0.5s_ease-out] w-full pt-7 flex flex-col bg-[#0B0F19]">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4 border-b border-slate-200 dark:border-slate-800/60 pb-5 px-2">
              <div>
                <h1 className="text-indigo-400 font-black tracking-widest text-xs uppercase mb-2 bg-indigo-500/10 inline-block px-2.5 py-1 rounded">ResumeTailor.AI</h1>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1 text-white">Tailored Resume</h2>
              </div>
              <div className="flex gap-3 w-full sm:w-auto" data-html2canvas-ignore="true">
                <button onClick={resetScanner} className="flex-1 sm:flex-none px-5 py-2.5 bg-[#1f2937] hover:bg-[#374151] text-white border border-slate-700 rounded-lg text-sm font-bold transition-all shadow-sm">
                  New Scan
                </button>
              </div>
            </div>

            <div id="panels-wrapper" className="flex flex-col lg:flex-row gap-8 items-start w-full pb-4">
              <div id="left-panel" className="w-full lg:w-[35%] flex flex-col gap-6 px-2 pb-10">
                
                <div className="bg-[#111827] p-8 rounded-2xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)] flex flex-col items-center justify-center flex-shrink-0">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Optimization Complete</h3>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-black text-slate-500 line-through">{score}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Old Score</span>
                    </div>
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    <div className="flex flex-col items-center">
                      <span className="text-6xl font-black text-emerald-400">{newScore}</span>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase mt-1">New Score</span>
                    </div>
                  </div>
                  <button onClick={downloadTailoredResume} disabled={isDownloading} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all text-sm">
                    {isDownloading ? (
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    )}
                    {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                </div>

                {missingKeywords.length > 0 && (
                  <CollapsibleSection title="Missing Core Keywords Added" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>}>
                    <div className="flex flex-wrap gap-2.5">
                      {missingKeywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-md text-xs font-semibold border border-emerald-500/20">+ {kw}</span>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {suggestions.length > 0 && (
                  <CollapsibleSection title="Impact & Metrics Enhancements" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>}>
                    <div className="space-y-6">
                      {suggestions.map((sug, i) => (
                        <div key={i} className="flex flex-col gap-3">
                          <span className="inline-block text-slate-400 text-[10px] font-bold uppercase tracking-widest">Target: {sug.section}</span>
                          <div className="p-3 bg-slate-900/50 rounded-lg border border-rose-900/20">
                            <span className="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">Original Phrasing</span>
                            <p className="text-slate-400 text-xs leading-relaxed">{sug.original_text}</p>
                          </div>
                          <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                            <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2">Optimized Injection</span>
                            <p className="text-slate-200 text-xs leading-relaxed font-medium">{sug.suggested_rewrite}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {semanticErrors.length > 0 && (
                  <CollapsibleSection title="Formatting Flaws Fixed" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>}>
                    <div className="space-y-6">
                      {semanticErrors.map((err, i) => (
                        <div key={i} className="flex flex-col gap-3">
                          <span className="inline-block text-slate-400 text-[10px] font-bold uppercase tracking-widest">Issue in {err.section}</span>
                          <p className="text-xs text-slate-400 line-through decoration-rose-500/50 leading-relaxed">{err.original_text}</p>
                          <div className="w-full bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                            <p className="text-xs font-medium text-emerald-400 leading-relaxed">{err.suggested_rewrite}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}
              </div>

              <div id="right-panel" className="w-full lg:w-[65%] flex flex-col gap-6 px-2 pb-10">
                <ResumeDocument fixedResume={tailoredResume} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}