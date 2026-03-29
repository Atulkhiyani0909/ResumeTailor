import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const AgentModal = ({ job, agentStep, agentProgress, emailDraft, setEmailDraft, setAgentStep, handleSendEmail }) => (
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
            <div className="h-full bg-indigo-500 transition-all duration-75" style={{ width: `${agentProgress}%` }}></div>
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
              <textarea className="flex-1 w-full bg-transparent p-5 text-sm text-slate-300 leading-relaxed outline-none resize-none" value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)}></textarea>
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
);