import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function DetailedJob() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Resume Tailoring State
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailoredScore, setTailoredScore] = useState(null);

  // Agent Email Flow State
  const [agentStep, setAgentStep] = useState(null); 
  const [scanProgress, setScanProgress] = useState(0);
  const [emailDraft, setEmailDraft] = useState('');

  // ----------------------------------------------------------------------
  // FETCH JOB DETAILS
  // ----------------------------------------------------------------------
  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/jobs/${id}`);
        if (response.data && response.data.job) {
          setJob(response.data.job);
        } else if (response.data) {
          setJob(response.data); 
        }
      } catch (err) {
        console.error("Error fetching job details:", err);
        setError("Failed to load job details. The job may have been removed.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchJob();
    }
  }, [id]);

  // ----------------------------------------------------------------------
  // ACTION: MATCH & TAILOR RESUME
  // ----------------------------------------------------------------------
  const handleTailorResume = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setTailorLoading(true);
    
    // Simulate AI parsing the JD and generating a tailored resume
    setTimeout(() => {
      setTailorLoading(false);
      setTailoredScore(98); // Return a high score indicating success
    }, 2500);
  };

  // ----------------------------------------------------------------------
  // ACTION: AGENT APPLY (HUMAN IN THE LOOP)
  // ----------------------------------------------------------------------
  const triggerAgentApply = () => {
    setAgentStep('tailoring');
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setEmailDraft(
              `Subject: Application for ${job.title} - Atul Khiyani\n\nHi ${job.company_name} Hiring Team,\n\nI am writing to express my strong interest in the ${job.title} position. With my background in modern web development and recent experience building scalable applications, I am confident in my ability to contribute immediately to your team.\n\nI have attached my resume, which has been tailored to highlight my experience with the technologies requested in your job description.\n\nLooking forward to discussing how my skills align with your needs.\n\nBest regards,\nAtul Khiyani\nhttps://github.com/Atulkhiyani0909`
            );
            setAgentStep('review');
          }, 500);
          return 100;
        }
        return prev + 1.5;
      });
    }, 40);
  };

  const handleSendEmail = () => {
    setAgentStep('sent');
    setTimeout(() => {
      setAgentStep(null);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <h2 className="text-3xl font-black mb-4">Job Not Found</h2>
        <p className="text-slate-400 mb-8">{error}</p>
        <button onClick={() => navigate('/jobs-agent')} className="px-6 py-3 bg-indigo-600 rounded-xl font-bold">Back to Job Board</button>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen pt-24 pb-20 bg-[#020617] text-slate-200 overflow-x-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 lg:px-8">
        
        {/* Navigation & Header */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          Back to Jobs
        </button>

        <div className="bg-[#0F1629]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-2xl mb-8 animate-[fadeIn_0.5s_ease-out]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-cyan-500 px-3 py-1 rounded-full mb-3 shadow-lg">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{job.source_from}</span>
              </div>
              {/* Reduced Title Size */}
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">{job.title}</h1>
              {/* Reduced Location & Company Size */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg> {job.company_name}</span>
                <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> {job.location}</span>
                <span className="px-2 py-0.5 bg-[#161E31] rounded-md font-mono text-[10px]">ID: {job._id.slice(-6)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Split */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Job Description */}
          <div className="lg:col-span-8 bg-[#0F1629]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 md:p-10 shadow-xl animate-[fadeIn_0.5s_ease-out_0.2s_both]">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
              Job Description
            </h2>
            <div className="prose prose-invert prose-sm md:prose-base max-w-none text-slate-300 leading-loose">
              <p className="whitespace-pre-wrap">{job.description}</p>
            </div>
          </div>

          {/* Right: Redesigned Action Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-4 sticky top-24 animate-[fadeIn_0.5s_ease-out_0.4s_both]">
            
            {/* Tool 1: Match & Tailor Resume */}
            <div className="bg-[#0F1629]/90 backdrop-blur-xl border border-white/10 rounded-[1.5rem] p-6 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h3 className="font-black text-white text-lg">Tailor Resume</h3>
              </div>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Upload your resume to instantly rewrite and optimize it according to this specific Job Description.
              </p>
              
              {tailoredScore ? (
                <div className="flex flex-col items-center">
                  <div className="w-full flex items-center justify-between bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl mb-4">
                    <span className="text-xs font-bold text-green-400">Match Score</span>
                    <span className="text-lg font-black text-green-400">{tailoredScore}%</span>
                  </div>
                  <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Download Tailored PDF
                  </button>
                </div>
              ) : tailorLoading ? (
                <div className="w-full py-3 bg-[#161E31] border border-white/5 rounded-xl flex justify-center">
                  <div className="w-5 h-5 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
                </div>
              ) : (
                <label className="w-full py-3 bg-[#161E31] hover:bg-[#1E293B] border border-white/10 text-white rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                  Upload & Match JD
                  <input type="file" className="hidden" accept=".pdf" onChange={handleTailorResume} />
                </label>
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
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                Generates a tailored outreach email on your behalf and sends it directly to the recruiter.
              </p>
              
              {job.recuriter_email ? (
                <button 
                  onClick={triggerAgentApply}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2"
                >
                  Launch Apply Agent
                </button>
              ) : (
                <button disabled className="w-full py-3 bg-slate-800/50 text-slate-500 rounded-xl font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2">
                  No Recruiter Email Found
                </button>
              )}
            </div>

            {/* Tool 3: Standard Apply Fallback */}
            <a 
              href={job.apply_link} 
              target="_blank" 
              rel="noreferrer" 
              className="w-full py-3 bg-transparent hover:bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              Apply on Platform Portal
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </a>

          </div>
        </div>

        {/* =========================================================================
            AGENT MODALS (Tailoring -> Review -> Sent)
            ========================================================================= */}
        {agentStep && (
          <div className="fixed inset-0 z-50 bg-[#020617]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-[#0F1629] border border-white/10 rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative">
              
              <div className="bg-slate-900/50 px-8 py-5 border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd"></path></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Agent Dispatch Terminal</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target: {job.recuriter_email}</p>
                  </div>
                </div>
                {agentStep !== 'loading' && (
                  <button onClick={() => setAgentStep(null)} className="text-slate-500 hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                )}
              </div>

              {agentStep === 'tailoring' && (
                <div className="flex-1 flex flex-col items-center justify-center p-20">
                  <div className="relative w-full max-w-md bg-slate-950 rounded-xl border border-white/5 p-6 font-mono text-sm text-indigo-400 shadow-inner overflow-hidden mb-8">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-500/10 to-transparent animate-[scan_2s_linear_infinite]"></div>
                    <p className="mb-2">{`> Authenticating secure connection to ${job.company_name}...`}</p>
                    <p className="mb-2 opacity-80">{`> Tailoring PDF resume to match JD...`}</p>
                    <p className="mb-2 opacity-60">{`> Drafting personalized outreach email...`}</p>
                    <p className="animate-pulse">{`> Awaiting Human Review_`}</p>
                  </div>
                  <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-75" style={{ width: `${scanProgress}%` }}></div>
                  </div>
                </div>
              )}

              {agentStep === 'review' && (
                <div className="flex-1 overflow-y-auto p-8 grid md:grid-cols-12 gap-8 bg-[#0B1121]">
                  <div className="md:col-span-5 flex flex-col gap-6">
                    <div className="bg-[#161E31] p-5 rounded-2xl border border-white/5">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Payload Ready
                      </h4>
                      <div className="flex items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-white/5 mb-3">
                        <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path></svg>
                        <div>
                          <p className="text-sm font-bold text-white">Atul_Khiyani_{job.company_name.replace(/\s+/g, '')}.pdf</p>
                          <p className="text-xs text-slate-500">100% Match Tailored Resume</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl text-indigo-300 text-sm leading-relaxed">
                      <strong className="text-indigo-400 block mb-1">Human in the Loop:</strong>
                      Review the generated email draft. You can edit the text directly before authorizing the agent to send it to the recruiter.
                    </div>
                  </div>

                  <div className="md:col-span-7 flex flex-col h-full">
                    <div className="bg-slate-950 border border-white/10 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-inner">
                      <div className="border-b border-white/5 p-4 bg-[#161E31] flex flex-col gap-2">
                        <div className="flex text-sm"><span className="w-16 text-slate-500">To:</span> <span className="text-white">{job.recuriter_email}</span></div>
                        <div className="flex text-sm"><span className="w-16 text-slate-500">Subj:</span> <span className="text-white font-bold">Application for {job.title} - Atul Khiyani</span></div>
                      </div>
                      <textarea 
                        className="flex-1 w-full bg-transparent p-5 text-sm text-slate-300 leading-relaxed outline-none resize-none"
                        value={emailDraft}
                        onChange={(e) => setEmailDraft(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}

              {agentStep === 'sent' && (
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h2 className="text-3xl font-black text-white mb-2">Payload Delivered</h2>
                  <p className="text-slate-400">Tailored resume and email successfully sent to {job.company_name}.</p>
                </div>
              )}

              {agentStep === 'review' && (
                <div className="bg-slate-900/80 px-8 py-5 border-t border-white/5 flex justify-end gap-4 sticky bottom-0">
                  <button onClick={() => setAgentStep(null)} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                  <button onClick={handleSendEmail} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center gap-2 transition-all hover:-translate-y-0.5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    Authorize & Send Email
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes scanLaser { 0% { top: -10%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
      `}</style>
    </div>
  );
}

export default DetailedJob;