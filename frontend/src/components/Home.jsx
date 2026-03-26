import { useNavigate } from "react-router-dom";
export default function Home() {

  const navigate = useNavigate();
  return (
    <main className="flex-1 w-full relative overflow-hidden transition-colors duration-300">
      
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 dark:bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-cyan-400/20 dark:bg-cyan-400/10 blur-[100px] pointer-events-none"></div>

    
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-32 pb-24 text-center sm:pt-40 sm:pb-32">
        
       
        <div className="inline-flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 px-3 py-1 rounded-full mb-8 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Apply Like Never Before</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-8 text-slate-900 dark:text-white leading-[1.1]">
          Land Your Dream Job with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400">
            AI-Powered Precision
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
          Stop guessing what recruiters want. Our intelligent platform analyzes your resume, perfectly matches it against job descriptions, and bypasses the ATS algorithms.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-full font-bold text-lg hover:-translate-y-1 transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_35px_rgba(79,70,229,0.6)] flex items-center justify-center gap-2" onClick={()=>{
            navigate('/ats-checker')
          }}>
            Analyze My Resume
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
          
         
        </div>

      
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 bg-slate-50/50 dark:bg-slate-900/50 py-32 border-y border-slate-200/50 dark:border-white/5 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">Your Unfair Advantage</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Three powerful AI tools engineered specifically to get you past the corporate filters and straight to the interview.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-400/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-50 dark:from-indigo-900/40 dark:to-blue-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 className="relative z-10 text-2xl font-bold mb-4 text-slate-900 dark:text-white">ATS Resume Checker</h3>
              <p className="relative z-10 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Score your resume against industry-standard systems. Identify missing keywords and formatting errors instantly.</p>
            </div>

            {/* Feature 2 */}
            <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group overflow-hidden md:-translate-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-blue-100 dark:border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              </div>
              <h3 className="relative z-10 text-2xl font-bold mb-4 text-slate-900 dark:text-white">JD Match Validator</h3>
              <p className="relative z-10 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Paste any Job Description. Our LLM engine dynamically rewrites your resume to highlight exactly what they are asking for.</p>
            </div>

            {/* Feature 3 */}
            <div className="relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 hover:border-purple-500/50 dark:hover:border-purple-400/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
              <div className="relative z-10 w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/20 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mb-8 shadow-sm border border-purple-100 dark:border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <h3 className="relative z-10 text-2xl font-bold mb-4 text-slate-900 dark:text-white">Auto Apply Agent</h3>
              <p className="relative z-10 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">Let our AI agent scour job boards and automatically apply to high-match positions using your tailored resume variants.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}