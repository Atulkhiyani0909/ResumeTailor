import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useAuth } from '@clerk/react';
import { JobHeader } from './jobheader';
import { CollapsibleSection } from './collapsableSection';
import { JobDescriptionView } from './jobDescriptionView';
import { AnalysisResultsView } from './AnalysisResultView';
import { ResumePreview } from './ResumePreview';
import { AgentModal } from './AgentModal';

const ActionSidebar = ({ 
  job, initialMatchScore, tailorStep, tailorLoading, tailoredScore, scanProgress, scanText, 
  userFeedback, setUserFeedback, isDownloading, handleAnalyzeResume, handleOptimization, 
  handleAcceptAndDownload, triggerAgentApply, hasSavedResume 
}) => (
  <div className="flex flex-col gap-4 sticky top-24 animate-[fadeIn_0.5s_ease-out_0.4s_both]">
    {/* INITIAL MATCH SCORE INDICATOR */}
    {initialMatchScore !== null && tailorStep === 'initial' && (
      <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-500/5 border border-indigo-500/30 rounded-[1.5rem] p-6 shadow-[0_0_20px_rgba(99,102,241,0.1)] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px]"></div>
        <div className="flex items-center justify-between mb-3 relative z-10">
          <span className="text-sm font-bold text-indigo-300 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Initial AI Match
          </span>
          <span className={`text-3xl font-black ${initialMatchScore > 80 ? 'text-green-400' : initialMatchScore > 65 ? 'text-amber-400' : 'text-rose-400'}`}>{initialMatchScore}%</span>
        </div>
        <p className="text-xs text-indigo-200/80 leading-relaxed relative z-10 p-3 bg-[#0B1121]/50 rounded-xl border border-white/5">
          <strong className="text-indigo-400 block mb-1">Note:</strong> Check the Job Description carefully. Use the Tailor Resume tool below to optimize your keywords to match this role before applying.
        </p>
      </div>
    )}

    {/* AI COPILOT TAILORING BOX */}
    <div className="bg-[#0F1629]/90 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
      <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <h3 className="font-black text-white text-lg">AI Copilot</h3>
      </div>
      
      {tailorStep === 'initial' && (
        <>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">Upload your resume to extract insights and generate a custom rewrite blueprint.</p>
          
          {hasSavedResume && (
            <button 
              onClick={() => handleAnalyzeResume(null, true)}
              className="w-full py-3 mb-3 bg-[#161E31] hover:bg-[#1E293B] border border-indigo-500/30 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)] flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Use Saved Resume
            </button>
          )}

          <label className="w-full py-3 bg-[#161E31] hover:bg-[#1E293B] border border-white/10 text-white rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
            {hasSavedResume ? "Upload New File" : "Upload Base Resume"}
            <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleAnalyzeResume(e, false)} />
          </label>
        </>
      )}

      {(tailorStep === 'analyzing' || tailorStep === 'processing') && (
        <div className="flex flex-col items-center py-4">
          <div className="w-12 h-12 relative mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
          <span className="text-xs font-bold text-indigo-400 mb-2">{scanText}</span>
          <div className="w-full bg-[#161E31] rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-500 h-full transition-all duration-75" style={{ width: `${scanProgress}%` }}></div>
          </div>
        </div>
      )}

      {tailorStep === 'results' && (
        <div className="flex flex-col">
          <button onClick={() => handleOptimization('start_tailoring')} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2 group">
            <svg className="w-4 h-4 group-hover:animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            Auto-Fix Everything
          </button>
        </div>
      )}

      {tailorStep === 'preview' && (
        <div className="flex flex-col">
          <button onClick={handleAcceptAndDownload} disabled={isDownloading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-black text-sm mb-6 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all">
            {isDownloading ? 'Generating PDF...' : 'Accept & Download PDF'}
          </button>
          <div className="border-t border-white/10 pt-5">
            <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              Human in the Loop (Optional)
            </h4>
            <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">Provide human context below and the AI will refix the document.</p>
            <textarea 
              className="w-full h-20 p-3 rounded-lg bg-[#060B19] border border-white/10 focus:border-indigo-500/50 outline-none text-xs text-white resize-none mb-3 custom-scrollbar"
              placeholder="e.g. 'Make the summary shorter...'"
              value={userFeedback}
              onChange={(e) => setUserFeedback(e.target.value)}
            ></textarea>
            <button onClick={() => handleOptimization('rewrite')} disabled={!userFeedback.trim()} className="w-full py-2 bg-[#161E31] hover:bg-[#1E293B] disabled:opacity-50 border border-white/5 text-white rounded-lg font-bold transition-all text-xs">
              Refix with Feedback
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Tool 2: Agent Apply */}
    <div className="bg-[#0F1629]/90 backdrop-blur-xl border border-indigo-500/20 rounded-[1.5rem] p-6 shadow-[0_0_20px_rgba(99,102,241,0.05)]">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd"></path></svg>
        </div>
        <h3 className="font-black text-white text-lg">Apply via Agent</h3>
      </div>
      <p className="text-xs text-slate-400 mb-5 leading-relaxed">Generates a tailored outreach email on your behalf and sends it directly to the recruiter.</p>
      
      {job.recuriter_email ? (
        <button onClick={triggerAgentApply} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2">
          Launch Apply Agent
        </button>
      ) : (
        <div className="flex flex-col gap-2">
          <button disabled className="w-full py-3 bg-[#161E31] text-slate-500 border border-rose-500/20 rounded-xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2">
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Launch Apply Agent
          </button>
          <p className="text-[11px] text-rose-400 text-center px-1 font-medium leading-relaxed">
            The email address for this Job poster is not available or not provided by the job poster.
          </p>
        </div>
      )}
    </div>

    {/* Tool 3: Standard Apply Fallback */}
    <a href={job.apply_link} target="_blank" rel="noreferrer" className="w-full py-3 bg-transparent hover:bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
      Apply on Platform Portal
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
    </a>
  </div>
);


export default function DetailedJob() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken, isSignedIn } = useAuth(); 
  
  const initialMatchScore = location.state?.matchScore || null;
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSavedResume, setHasSavedResume] = useState(false);

  
  const [tailorStep, setTailorStep] = useState('initial'); 
  const [file, setFile] = useState(null);
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailoredScore, setTailoredScore] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [fixedResume, setFixedResume] = useState(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanText, setScanText] = useState('');
  const [userFeedback, setUserFeedback] = useState('');
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

 
  const [agentStep, setAgentStep] = useState(null); 
  const [agentProgress, setAgentProgress] = useState(0);
  const [emailDraft, setEmailDraft] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
   
        const headers = isSignedIn ? { Authorization: `Bearer ${await getToken()}` } : {};
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`, { headers });
        
        if (response.data && response.data.job) setJob(response.data.job);
        else if (response.data) setJob(response.data); 
      } catch (err) {
        setError("Failed to load job details. The job may have been removed.");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchJob();
  }, [id, isSignedIn, getToken]);

  useEffect(() => {
    async function checkSavedResume() {
      if (isSignedIn) {
        try {
          const token = await getToken();
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.data?.success) {
            if (res.data.user?.resumeUrl) setHasSavedResume(true);
         
            if (res.data.user?.email) setSenderEmail(res.data.user.email);
          }
        } catch (error) {
          console.error("Failed to fetch user profile", error);
        }
      }
    }
    checkSavedResume();
  }, [isSignedIn, getToken]);



  const handleAnalyzeResume = async (e, useSaved = false) => {
    let uploadedFile = null;

    if (!useSaved) {
      uploadedFile = e?.target?.files[0];
      if (!uploadedFile) return;
      if (e.target) e.target.value = null;
    }
    
    setFile(uploadedFile || { name: 'Saved Profile Resume' });
    setTailorStep('analyzing');
    setTailorLoading(true);
    setScanProgress(0);

    try {
      const token = await getToken(); 
      const formData = new FormData();
      
      if (uploadedFile) {
        formData.append('resume', uploadedFile); 
      }
      formData.append('jd_content', `${job.title}\n\n${job.description}`);

      setScanText('Transmitting payload to backend...');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/jd-matcher/analyze`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });

      const payload = response.data;
      const fullState = payload.response || payload.data || payload; 
      
      setAnalysisResults(fullState);
      setTailoredScore(fullState.match_score || 0);
      setTailorLoading(false); 
    } catch (err) {
      alert("Analysis failed. Check Your API Key Quota Limit");
      setTailorStep('initial');
      setTailorLoading(false);
    }
  };

  const handleOptimization = async (actionType) => {
    if (actionType === 'rewrite' && !userFeedback.trim()) return;
    
    setIsAutoFixing(actionType === 'start_tailoring');
    setTailorStep('processing');
    setTailorLoading(true);
    setScanProgress(0);

    try {
      const token = await getToken();
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/jd-matcher/tailor`, {
        action: actionType,
        feedback: actionType === 'rewrite' ? userFeedback : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const payload = response.data;
      const fullState = payload.response || payload.data || payload;
      
      setFixedResume(fullState.tailored_resume_content);
      if (fullState.match_score) setTailoredScore(fullState.match_score);
      if (actionType === 'rewrite') setUserFeedback('');
      
      setTailorLoading(false);
    } catch (err) {
      alert(`${actionType === 'rewrite' ? 'Rewrite' : 'Auto-fix'} failed. try Again later ( Check Quota Limit on API Key)`);
      setTailorStep(actionType === 'rewrite' ? 'preview' : 'results');
      setTailorLoading(false);
    }
  };

  const handleAcceptAndDownload = async () => {
    setIsDownloading(true);
    try {
      const token = await getToken();
      await axios.post(`${import.meta.env.VITE_API_URL}/api/jd-matcher/tailor`, { action: 'accept' }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(e => console.warn(e));
      
      const resumePreview = document.getElementById('resume-preview');
      const originalStyle = { height: resumePreview.style.height, maxHeight: resumePreview.style.maxHeight, overflow: resumePreview.style.overflow };

      resumePreview.style.height = 'max-content';
      resumePreview.style.maxHeight = 'none';
      resumePreview.style.overflow = 'visible';

      await new Promise((resolve) => setTimeout(resolve, 300));
      const dataUrl = await toPng(resumePreview, { cacheBust: true, backgroundColor: '#FFFFFF', pixelRatio: 2, style: { transform: 'scale(1)', transformOrigin: 'top left' } });

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
    } catch (err) {
      alert("Failed to finalize resume or generate PDF. Please Try Later");
    } finally {
      setIsDownloading(false);
    }
  };



  
  const triggerAgentApply = async () => {
    setAgentStep('tailoring');
    setAgentProgress(10); 
    

    const uxInterval = setInterval(() => {
        setAgentProgress(prev => (prev < 90 ? prev + 2 : prev));
    }, 200);

    try {
      const token = await getToken();
      

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/email/draft-email`, {
        raw_jd_content: `${job.title}\n\n${job.description}`,
        raw_resume_content: "Use base resume profile",
        receiver_email: job.recuriter_email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      clearInterval(uxInterval);
      setAgentProgress(100);
      
      const payload = response.data;
      
      setEmailSubject(payload.draft_subject || 'Application Draft');
      setEmailDraft(payload.draft_content || '');
      setReceiverEmail(job.recuriter_email || '');
      
      setTimeout(() => setAgentStep('review'), 500);

    } catch (error) {
      clearInterval(uxInterval);
      console.error("Drafting error", error);
      alert("Failed to draft email. Ensure you have your Gemini Key saved in your secrets. and Secrets Email and Password Avaliable");
      setAgentStep(null);
    }
  };

  const handleSendEmail = async () => {
    try {
        setAgentStep('sending'); 
        const token = await getToken();

        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/email/approve-send`, {
            email_subject: emailSubject,
            email_content: emailDraft,
            sender_email: senderEmail,
            receiver_email: receiverEmail
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // STRICT CHECK: Ensure the backend explicitly returns success: true
        if (response.data && response.data.success === true) {
            setAgentStep('sent');
            setTimeout(() => { setAgentStep(null); }, 4000);
        } else {
            // Revert back if backend encountered an error with credentials/SMTP
            console.warn("Backend rejected the send request:", response.data);
            alert(`Email delivery failed: ${response.data?.error || "Check your SMTP App Password in your Secrets."}`);
            setAgentStep('review'); 
        }
    } catch (error) {
        console.error("Sending error:", error);
        alert("An error occurred. Failed to send email. Check your network or server status.");
        setAgentStep('review'); 
    }
  };



  useEffect(() => {
    if (tailorStep === 'analyzing' || tailorStep === 'processing') {
      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (tailorLoading && prev >= 90) return 90;
          if (!tailorLoading && prev < 100) return prev + 5; 
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (tailorStep === 'analyzing') setTailorStep('results');
              else if (tailorStep === 'processing') setTailorStep('preview');
            }, 300);
            return 100;
          }
          
          const newProgress = prev + 1;
          if (tailorStep === 'analyzing') {
            if (newProgress === 35) setScanText('Vectorizing JD & Resume data...');
            if (newProgress === 60) setScanText('Calculating AI Match Score...');
            if (newProgress === 85) setScanText('Drafting AI improvement plan...');
          } else {
            if (newProgress === 10) setScanText(isAutoFixing ? 'Auto-generating optimal contexts...' : 'Applying human feedback...');
            if (newProgress === 40) setScanText('Rewriting bullet points & injecting metrics...');
            if (newProgress === 90 && tailorLoading) setScanText('Waiting for LangGraph generation...');
          }
          return newProgress;
        });
      }, 50); 
      return () => clearInterval(interval);
    }
  }, [tailorStep, tailorLoading, isAutoFixing]);


  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#020617]"><div className="w-16 h-16 relative"><div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div><div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div></div></div>;
  if (error || !job) return <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white"><h2 className="text-3xl font-black mb-4">Job Not Found</h2><p className="text-slate-400 mb-8">{error}</p><button onClick={() => navigate('/jobs-agent')} className="px-6 py-3 bg-indigo-600 rounded-xl font-bold">Back to Job Board</button></div>;


  return (
    <div className="relative w-full min-h-screen pt-24 pb-20 bg-[#020617] text-slate-200 overflow-x-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8">
        
        <JobHeader job={job} onBack={() => navigate(-1)} />

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Content Area */}
          <div className="lg:col-span-8 flex flex-col">
            
            {tailorStep === 'initial' && (
              <div className="bg-[#0F1629]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 md:p-10 shadow-xl animate-[fadeIn_0.5s_ease-out]">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                  Job Description
                </h2>
                <JobDescriptionView description={job.description} />
              </div>
            )}

            {tailorStep === 'results' && analysisResults && (
              <div className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
                <div className="bg-[#0F1629]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-xl">
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
                    Job Description
                  </h2>
                  <JobDescriptionView description={job.description} />
                </div>

                <div className="bg-[#0F1629] rounded-[2rem] border border-white/5 overflow-hidden flex flex-col shadow-xl">
                  <div className="bg-[#161E31] px-6 py-4 border-b border-white/5 flex items-center gap-3">
                    <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-md">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </div>
                    <h3 className="font-bold text-white text-lg">AI Blueprint & Alignment</h3>
                    <span className="text-[11px] text-slate-400 font-medium ml-2">Click "Auto-Fix Everything" to apply</span>
                  </div>
                  <div className="p-6 max-h-[600px] overflow-y-auto custom-scrollbar">
                    <AnalysisResultsView analysisResults={analysisResults} />
                  </div>
                </div>
              </div>
            )}

            {tailorStep === 'preview' && fixedResume && (
              <div className="flex flex-col gap-6 animate-[fadeIn_0.5s_ease-out]">
                
                <CollapsibleSection 
                  title="View Original Job Description" 
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>}
                >
                  <JobDescriptionView description={job.description} />
                </CollapsibleSection>

                <CollapsibleSection 
                  title="View AI Blueprint & Alignment" 
                  icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>}
                >
                  <AnalysisResultsView analysisResults={analysisResults} />
                </CollapsibleSection>

                <ResumePreview fixedResume={fixedResume} />
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar */}
          <div className="lg:col-span-4">
            <ActionSidebar 
              job={job}
              initialMatchScore={initialMatchScore}
              tailorStep={tailorStep}
              tailorLoading={tailorLoading}
              tailoredScore={tailoredScore}
              scanProgress={scanProgress}
              scanText={scanText}
              userFeedback={userFeedback}
              setUserFeedback={setUserFeedback}
              isDownloading={isDownloading}
              handleAnalyzeResume={handleAnalyzeResume}
              handleOptimization={handleOptimization}
              handleAcceptAndDownload={handleAcceptAndDownload}
              triggerAgentApply={triggerAgentApply}
              hasSavedResume={hasSavedResume}
            />
          </div>
        </div>

        {/* MODAL INTEGRATION */}
        {agentStep && (
          <AgentModal 
            job={job} 
            agentStep={agentStep} 
            agentProgress={agentProgress} 
            emailSubject={emailSubject}
            setEmailSubject={setEmailSubject}
            emailDraft={emailDraft} 
            setEmailDraft={setEmailDraft}
            senderEmail={senderEmail}
            setSenderEmail={setSenderEmail}
            receiverEmail={receiverEmail}
            setReceiverEmail={setReceiverEmail}
            setAgentStep={setAgentStep} 
            handleSendEmail={handleSendEmail} 
          />
        )}

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scanLaser { 0% { top: -10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}