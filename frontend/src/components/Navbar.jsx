import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Show, SignInButton, SignUpButton, UserButton, UserProfile } from '@clerk/react'

export default function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to close menu when a link is clicked on mobile
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

        {/* LOGO */}
        <div 
          className="text-2xl font-black tracking-tighter cursor-pointer flex items-center z-50" 
          onClick={() => {
            navigate('/');
            closeMenu();
          }}
        >
          <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">Resume</span>
          <span className="text-white">Tailor</span>
          <span className="text-indigo-500 ml-0.5">.AI</span>
        </div>

        {/* DESKTOP NAVIGATION LINKS */}
        <div className="hidden md:flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <Link to="/ats-checker" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-sm transition-all duration-200">
            ATS SCORE
          </Link>
          <Link to="/jd-match" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-sm transition-all duration-200">
            JD MATCHER
          </Link>
          <Link to="/jobs-apply" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white hover:shadow-sm transition-all duration-200">
            SMART JOB AGENT
          </Link>
        </div>

        {/* RIGHT SIDE: AUTH BUTTONS & MOBILE TOGGLE */}
        <div className="flex items-center space-x-4 z-50">
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:-translate-y-0.5">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)] hover:-translate-y-0.5">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
          </div>

          {/* User Profile (Visible on both Mobile & Desktop) */}
          <Show when="signed-in">
            <UserButton afterSignOutUrl="/" />
          </Show>

          {/* Mobile Hamburger Toggle */}
          <button 
            className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden bg-[#0F1629]/95 backdrop-blur-3xl border-b border-white/5 ${isMobileMenuOpen ? 'max-h-[500px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'}`}>
        <div className="flex flex-col items-center space-y-2 px-6">
          <Link to="/ats-checker" onClick={closeMenu} className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200">
            ATS SCORE
          </Link>
          <Link to="/jd-match" onClick={closeMenu} className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200">
            JD MATCHER
          </Link>
          <Link to="/jobs-apply" onClick={closeMenu} className="w-full text-center px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200">
            SMART JOB AGENT
          </Link>


          
          {/* Mobile Auth Buttons */}
          <Show when="signed-out">
            <div className="flex flex-col w-full gap-3 pt-4 mt-2 border-t border-white/10">
              <SignInButton mode="modal">
                <button onClick={closeMenu} className="w-full px-4 py-3 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/5 hover:text-white border border-white/10 transition-all duration-200">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button onClick={closeMenu} className="w-full px-6 py-3 text-sm font-bold text-white transition-all duration-200 bg-gradient-to-r from-indigo-600 to-cyan-500 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </Show>
          
        </div>
      </div>
    </nav>
  );
}