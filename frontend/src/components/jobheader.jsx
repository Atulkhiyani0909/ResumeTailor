import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const JobHeader = ({ job, onBack }) => (
  <>
    <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-bold text-sm">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
      Back to Jobs
    </button>
    <div className="bg-[#0F1629]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-2xl mb-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-cyan-500 px-3 py-1 rounded-full mb-3 shadow-lg">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{job.source_from || 'Direct'}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg> {job.company_name}</span>
            <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> {job.location}</span>
            <span className="px-2 py-0.5 bg-[#161E31] rounded-md font-mono text-[10px]">ID: {job._id ? job._id.slice(-6) : 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  </>
);