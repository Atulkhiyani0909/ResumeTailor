import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const [isDarkMode, setIsDarkMode] = useState(false);
   const navigate = useNavigate();
 
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        
       
        <div className="text-2xl font-black tracking-tighter cursor-pointer flex items-center" onClick={()=>{
          navigate('/')
        }}>
          <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">Resume</span>
          <span className="text-slate-900 dark:text-white">Tailor</span>
          <span className="text-indigo-500 ml-0.5">.AI</span>
        </div>

       
        <div className="hidden md:flex items-center space-x-2 bg-slate-100/50 dark:bg-white/5 px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-white/10">
         
          <a href="/ats-checker" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:shadow-sm transition-all duration-200">
            ATS SCORE
          </a>
          <a href="/jd-match" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:shadow-sm transition-all duration-200">
            JD MATCHER
          </a>
           <a href="/jobs-apply" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white hover:shadow-sm transition-all duration-200">
            SMART JOB AGENT
          </a>
        </div>

        
        <div className="flex items-center space-x-5">
         
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="group relative p-2.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-all duration-300"
            aria-label="Toggle Dark Mode"
          >
            <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
              <svg 
                className={`absolute w-5 h-5 transition-all duration-500 ease-in-out ${isDarkMode ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100 group-hover:rotate-90'}`} 
                fill="currentColor" viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
              <svg 
                className={`absolute w-5 h-5 transition-all duration-500 ease-in-out ${isDarkMode ? 'translate-y-0 opacity-100 group-hover:rotate-90' : '-translate-y-10 opacity-0'}`} 
                fill="currentColor" viewBox="0 0 20 20"
              >
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            </div>
          </button>
          
       
          <button className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] hover:-translate-y-0.5">
            Login 
          </button>
        </div>

      </div>
    </nav>
  );
}