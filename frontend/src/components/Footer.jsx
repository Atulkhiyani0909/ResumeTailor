import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-slate-950 transition-colors duration-300">
         <Show when={'signed-out'}>
      
      <div className="border-t border-slate-200 dark:border-white/5 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6 text-slate-900 dark:text-white tracking-tight">Ready to bypass the algorithms ?</h2>
       
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto font-medium">Join thousands of job seekers who are using AI to land interviews at top tech companies.</p>
          
           <button className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold hover:-translate-y-1 transition-transform shadow-lg">
            <SignUpButton displayName={'Create Account'}/>
          </button>
         
        </div>
      </div>
 </Show>
      {/* Main Footer Links */}
      <div className="border-t border-slate-200 dark:border-white/5 pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-20 mb-16">
            
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <div className="text-xl font-black tracking-tighter mb-4 text-indigo-600 dark:text-indigo-400">
                ResumeTailor<span className="text-slate-900 dark:text-white">.AI</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                The intelligent career copilot. Build, match, and apply with precision.
              </p>
            </div>

            {/* Product Column */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                <li><Link to="/ats-checker" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">ATS Checker</Link></li>
                <li><Link to="/jd-match" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">JD Match Validator</Link></li>
                <li><Link to="/jobs-apply" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Job Agent</Link></li>
                
              </ul>
            </div>

           
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
               <li>
  <a 
    href="mailto:atulkhiyani09@gmail.com" 
    className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
  >
    Contact
  </a>
</li>
              </ul>
            </div>

            
          </div>

         
          <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-500">
             ResumeTailor.AI 
            </p>
            <div className="flex space-x-4 text-slate-400">
             
             
              <a target='blank' href="https://github.com/Atulkhiyani0909" className="hover:text-slate-900 dark:hover:text-white transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}