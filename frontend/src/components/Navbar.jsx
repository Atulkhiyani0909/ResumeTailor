import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Show, SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/react';
import axios from 'axios';

const SecretsModal = ({ isOpen, onClose }) => {
  const [resumeUrl, setResumeUrl] = useState(null);
  const [geminiKey, setGeminiKey] = useState('');
  
  const [smtpEmail, setSmtpEmail] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const { getToken } = useAuth();

  useEffect(() => {
    if (isOpen) {
      const fetchProfile = async () => {
        try {
          const token = await getToken(); 
          const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
            headers: { Authorization: `Bearer ${token}` } 
          });

          if (res.data.success) {
            setResumeUrl(res.data.user.resumeUrl);
            setGeminiKey(res.data.user.API_key_Gemini || '');
          
            setSmtpEmail(res.data.user.email_user || '');
            setSmtpPass(res.data.user.email_pass || '');
          }
        } catch (err) {
          console.error("Failed to fetch profile", err);
        }
      };
      fetchProfile();
    }
  }, [isOpen, getToken]); 

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    
    const formData = new FormData();
    
    if (geminiKey) {
      formData.append('API_key_Gemini', geminiKey);
    }

    if (smtpEmail) {
      formData.append('email_user', smtpEmail);
    }
    if (smtpPass) {
      formData.append('email_pass', smtpPass);
    }
    if (selectedFile) {
      formData.append('resume', selectedFile);
    }

    try {
      const token = await getToken();

      const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/users/profile`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      
      if (res.data.success) {
        setMessage('Secrets saved successfully!');
        setResumeUrl(res.data.user.resumeUrl);
        setSelectedFile(null);
        setSmtpPass(res.data.user.email_pass); 
        
        setTimeout(() => {
          setMessage('');
          onClose(); 
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#0F1629] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header - Made Sticky */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#0F1629] z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Your Secrets
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3">Base Resume</label>
            {resumeUrl && !selectedFile && (
              <div className="mb-3 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                <span className="text-xs text-indigo-300 font-medium truncate pr-4">Active Resume Linked</span>
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 shrink-0">View PDF</a>
              </div>
            )}
            
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-xl bg-[#161E31] hover:bg-[#1E293B] transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center text-center p-2">
                <svg className="w-5 h-5 text-slate-400 mb-1 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                <p className="text-[11px] font-bold text-slate-300">{selectedFile ? selectedFile.name : "Upload New Resume PDF"}</p>
              </div>
              <input type="file" className="hidden" accept=".pdf" onChange={(e) => setSelectedFile(e.target.files[0])} />
            </label>
            {/* NEW NOTE ADDED HERE */}
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Note: Resume must be 1 page and less than 2MB.</p>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3">Gemini API Key</label>
            <input 
              type="text" 
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full p-3 rounded-xl bg-[#161E31] border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-white font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-2">Stored securely. Used for local tailoring.</p>
          </div>

          {/* Agent SMTP Email */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3">Agent Email (Gmail)</label>
            <input 
              type="email" 
              value={smtpEmail}
              onChange={(e) => setSmtpEmail(e.target.value)}
              placeholder="youremail@gmail.com"
              className="w-full p-3 rounded-xl bg-[#161E31] border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-white font-mono"
            />
          </div>

          {/* Agent SMTP App Password */}
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-3">Google App Password</label>
            <input 
              type="text" 
              value={smtpPass}
              onChange={(e) => setSmtpPass(e.target.value)}
              placeholder="xxxx xxxx xxxx xxxx"
              className="w-full p-3 rounded-xl bg-[#161E31] border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm text-white font-mono tracking-widest"
            />
            <p className="text-[10px] text-slate-500 mt-2">Required for the Smart Job Agent to send outreach emails on your behalf.</p>
          </div>
        </div>

        {/* Footer - Made Sticky */}
        <div className="p-6 border-t border-white/5 flex items-center justify-between bg-[#0A0F1D] sticky bottom-0 z-10">
          <span className={`text-xs font-bold ${message.includes('success') ? 'text-emerald-400' : 'text-rose-400'}`}>
            {message}
          </span>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};


export default function Navbar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSecretsModalOpen, setIsSecretsModalOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Secrets Modal Overlay */}
      <SecretsModal isOpen={isSecretsModalOpen} onClose={() => setIsSecretsModalOpen(false)} />

      <nav className="fixed top-0 z-40 w-full border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

          {/* LOGO */}
          <div 
            className="text-2xl font-black tracking-tighter cursor-pointer flex items-center" 
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
          <div className="flex items-center space-x-4">
            
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

            {/* Authenticated User Controls */}
            <Show when="signed-in">
              {/* Custom Secrets Button */}
              <button 
                onClick={() => setIsSecretsModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Secrets
              </button>

              {/* Default Clerk User Button */}
              <div className="pl-2 border-l border-white/10 hidden md:block">
                <UserButton afterSignOutUrl="/" />
              </div>
            </Show>

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center gap-4 md:hidden">
              <Show when="signed-in">
                <UserButton afterSignOutUrl="/" />
              </Show>
              <button 
                className="p-2 text-slate-300 hover:text-white focus:outline-none transition-colors"
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

            <Show when="signed-in">
              <button 
                onClick={() => {
                  closeMenu();
                  setIsSecretsModalOpen(true);
                }} 
                className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-2 rounded-xl text-sm font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Manage Secrets
              </button>
            </Show>

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
    </>
  );
}