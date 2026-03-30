import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Show, SignInButton, SignUpButton, useAuth } from '@clerk/react';

export default function JobsAgent() {
  const navigate = useNavigate();

  const { getToken, isSignedIn } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('All');
  const [filterLocation, setFilterLocation] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  const [isMatched, setIsMatched] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  

  const [hasSavedResume, setHasSavedResume] = useState(false);


  useEffect(() => {
    async function get_jobs() {
      const cachedJobs = sessionStorage.getItem('aiMatchedJobs');

      if (cachedJobs) {
        setJobs(JSON.parse(cachedJobs));
        setIsMatched(true);
        setSortBy('match');
        setLoadingJobs(false);
        return;
      }

      try {
       
        let headers = {};
        if (isSignedIn) {
          const token = await getToken();
          headers = { Authorization: `Bearer ${token}` };
        }

        const result = await axios.get('http://localhost:3000/api/jobs', { headers });
        if (result.data && result.data.success) {
          const dbJobs = result.data.jobs.map(job => ({ ...job, matchScore: 0 }));
          setJobs(dbJobs);
        }
      } catch (error) {
        console.error("Error fetching jobs from database:", error);
      } finally {
        setLoadingJobs(false);
      }
    }

    get_jobs();
  }, [isSignedIn, getToken]);

 
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

  const uniqueLocations = ['All', ...new Set(jobs.map(job => job.location).filter(Boolean))];
  const uniqueSources = ['All', ...new Set(jobs.map(job => job.source_from).filter(Boolean))];

 
  const executeSmartMatch = async (file = null) => {
    setMatchLoading(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 90) return 90;
        return prev + 5;
      });
    }, 200);

    try {
      const token = await getToken();
      const formData = new FormData();
      
   
      if (file) {
        formData.append('resume', file);
      }

      const result = await axios.post('http://localhost:3000/api/jobs/matched-jobs', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (result.data && result.data.success) {
        clearInterval(interval);
        setScanProgress(100);

        setTimeout(() => {
          setMatchLoading(false);
          const incomingJobs = result.data.matched_jobs?.response;

          if (!incomingJobs || !Array.isArray(incomingJobs) || incomingJobs.length === 0) {
            alert("Resume analyzed successfully, but the AI couldn't find any matching jobs right now.");
            setIsMatched(false);
            return;
          }

          setIsMatched(true);
          setSortBy('match');

          const scoredJobs = incomingJobs.map((job) => ({
            ...job,
            _id: job._id,
            matchScore: job.score ? Math.round(job.score * 100) : 0,
            description: job.description || "AI Matched Role - Description details pending...",
            location: job.location || "Location Unspecified",
            source_from: job.source_from || "Smart Match"
          }));

          setJobs(scoredJobs);
          sessionStorage.setItem('aiMatchedJobs', JSON.stringify(scoredJobs));

        }, 500);
      } else {
        throw new Error("Backend reported failure");
      }
    } catch (error) {
      console.error("Error matching jobs:", error);
      clearInterval(interval);
      setMatchLoading(false);
      alert("Failed to analyze resume and match jobs. Check console for details.");
    }
  };

  const handleSmartMatchUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      executeSmartMatch(file);
    }
    e.target.value = null; 
  };

  const handleViewDetails = (jobId, score) => {
    navigate(`/job/${jobId}`, { state: { matchScore: score } });
  };

  const processedJobs = jobs
    .filter(job => {
      const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || job.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSource = filterSource === 'All' || job.source_from === filterSource;
      const matchesLocation = filterLocation === 'All' || job.location === filterLocation;

      return matchesSearch && matchesSource && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'match' && isMatched) {
        return b.matchScore - a.matchScore;
      }
      return 0;
    });

  return (
    <div className="relative w-full min-h-screen pt-24 pb-20 bg-[#020617] text-slate-200 overflow-x-hidden font-sans">

      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-8">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 animate-[fadeIn_0.5s_ease-out]">
          <div>
            <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full mb-4">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Autonomous Sourcing</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Job Discovery Board</h1>
            <p className="text-slate-400 text-lg">Find your next role. Click any job to view details and launch the Auto Apply Agent.</p>
          </div>

          <Show when={'signed-in'}>
            {!isMatched && !matchLoading && !loadingJobs && (
              <div className="flex flex-col items-center md:items-end gap-3">
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
                  
                  {/* 5. Dynamically show 'Use Saved' button if they have one */}
                  {hasSavedResume && (
                    <button
                      onClick={() => executeSmartMatch(null)}
                      className="px-6 py-4 bg-[#161E31] hover:bg-[#1E293B] border border-indigo-500/30 text-white rounded-xl font-black transition-all shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:-translate-y-1 flex items-center justify-center gap-2 group whitespace-nowrap"
                    >
                      <svg className="w-5 h-5 text-indigo-400 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      Use Saved Resume
                    </button>
                  )}

                  <label className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white rounded-xl font-black transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-1 cursor-pointer flex items-center justify-center gap-2 group whitespace-nowrap">
                    <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                    {hasSavedResume ? "Upload New" : "Smart Match Resume"}
                    <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleSmartMatchUpload} />
                  </label>
                </div>
                
                <p className="text-[11px] text-slate-500 font-medium mt-1 max-w-[300px] text-center md:text-right leading-relaxed">
                  <strong className="text-cyan-400">What is this?</strong> Upload your resume and our AI will vectorize it to instantly surface and rank the jobs that best match your experience.
                </p>
              </div>
            )}
          </Show>

        </div>

        {isMatched && (
          <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-start gap-4 animate-[fadeIn_0.5s_ease-out]">
            <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <h4 className="text-white font-bold mb-1">Understanding Your Match Scores</h4>
              <p className="text-sm text-indigo-200/80 leading-relaxed">
                The percentage shown on each job card represents the AI Semantic Match Score. Our engine vectorized your resume and compared it against the core requirements of each role. A higher score indicates a stronger alignment of your skills and experience to the specific job description.
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#0F1629]/80 backdrop-blur-xl border border-white/5 p-3 rounded-2xl flex flex-col lg:flex-row gap-3 mb-10 shadow-xl animate-[fadeIn_0.5s_ease-out]">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder="Search roles or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161E31] border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-[#161E31] border border-white/5 rounded-xl px-3 py-1 text-sm focus-within:border-indigo-500/50 transition-colors">
              <svg className="w-4 h-4 text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer py-1.5 appearance-none pr-4"
              >
                {uniqueLocations.map(loc => <option key={loc} value={loc} className="bg-slate-900">{loc}</option>)}
              </select>
            </div>

            <div className="flex items-center bg-[#161E31] border border-white/5 rounded-xl px-3 py-1 text-sm focus-within:border-indigo-500/50 transition-colors">
              <svg className="w-4 h-4 text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer py-1.5 appearance-none pr-4"
              >
                {uniqueSources.map(source => (
                  <option key={source} value={source} className="bg-slate-900">
                    {source === 'All' ? 'All Platforms' : source}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center bg-[#161E31] border border-white/5 rounded-xl px-3 py-1 text-sm focus-within:border-indigo-500/50 transition-colors">
              <svg className="w-4 h-4 text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer py-1.5 appearance-none pr-4"
              >
                <option value="recent" className="bg-slate-900">Sort: Recent</option>
                <option value="match" disabled={!isMatched} className="bg-slate-900">Sort: Best Match {isMatched ? '' : '(Requires Scan)'}</option>
              </select>
            </div>
          </div>
        </div>

        {loadingJobs && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {!loadingJobs && processedJobs.length === 0 && (
          <div className="text-center py-20 bg-[#0F1629]/50 rounded-3xl border border-white/5">
            <p className="text-slate-400">No jobs found matching your criteria.</p>
            <button onClick={() => { setSearchTerm(''); setFilterSource('All'); setFilterLocation('All'); }} className="mt-4 text-indigo-400 hover:text-indigo-300 font-bold underline">Clear Filters</button>
          </div>
        )}

        <Show when={'signed-in'}>
          {!loadingJobs && processedJobs.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-[fadeIn_0.5s_ease-out]">
              {processedJobs.map((job) => (
                <div key={job._id || job.id} className="relative bg-[#0F1629]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-indigo-500/50 transition-all shadow-xl group flex flex-col h-full pt-12 overflow-hidden cursor-default">

                  <div className="absolute top-0 right-0 bg-gradient-to-bl from-indigo-600 to-cyan-500 px-4 py-1.5 rounded-bl-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg z-10">
                    {job.source_from}
                  </div>

                  {isMatched && (
                    <div className={`absolute top-4 left-4 flex flex-col items-center justify-center w-10 h-10 rounded-full border-2 z-10 ${job.matchScore > 80 ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : job.matchScore > 65 ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-rose-500/50 bg-rose-500/10 text-rose-400 shadow-[0_0_15px_rgba(243,62,113,0.2)]'}`}>
                      <span className="text-sm font-black leading-none">{job.matchScore}%</span>
                    </div>
                  )}

                  <div className={`mb-4 flex-1 ${isMatched ? 'mt-4' : ''}`}>
                    <h4 className="text-xl font-black text-cyan-400 mb-1">{job.company_name}</h4>

                    <h3 className="text-lg font-bold text-white leading-tight mb-3 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                      {job.title}
                    </h3>

                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-4">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      {job.location}
                    </span>

                    <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">
                      {job.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleViewDetails(job._id || job.id, job.matchScore)}
                    className="w-full py-3 mt-auto bg-[#161E31] hover:bg-indigo-600 border border-white/5 hover:border-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 group/btn"
                  >
                    View Details
                    <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                  </button>

                </div>
              ))}
            </div>
          )}

          {matchLoading && (
            <div className="fixed inset-0 z-50 bg-[#020617]/90 backdrop-blur-xl flex flex-col items-center justify-center animate-[fadeIn_0.3s_ease-out]">
              <div className="w-24 h-24 relative mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin"></div>
              </div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Vectorizing Profile Data...</h2>
              <p className="text-indigo-400 font-mono text-sm mb-8">Cross-referencing global job cache</p>
              <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-75" style={{ width: `${scanProgress}%` }}></div>
              </div>
            </div>
          )}
        </Show>
        <Show when={'signed-out'}>
          <div className="relative w-full max-w-md mx-auto p-8 md:p-10 rounded-[2.5rem] bg-[#0F1629]/80 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden group hover:border-white/10 transition-all duration-500 animate-[fadeIn_0.5s_ease-out]">

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[50px] transition-transform duration-700 group-hover:scale-125 pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center">

              <div className="w-16 h-16 rounded-2xl bg-[#161E31] border border-white/5 flex items-center justify-center text-indigo-400 mb-6 shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] group-hover:-translate-y-1 transition-all duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>

              <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-full mb-4">
                <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Authentication Required</span>
              </div>

              <h3 className="text-3xl font-black text-white tracking-tight mb-3">
                Unlock Your Agent
              </h3>

              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                Create an account to save your tailored resumes, launch autonomous apply agents, and track your match scores.
              </p>

              <div className="w-full">
                <SignUpButton
                  mode="modal"
                  forceRedirectUrl="/jobs-apply"
                  signInForceRedirectUrl="/jobs-apply"
                >
                  <button className="w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl font-black text-sm transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2 group">
                    Create Free Account
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                </SignUpButton>
              </div>

            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}