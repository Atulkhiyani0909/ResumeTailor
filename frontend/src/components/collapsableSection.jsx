import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const CollapsibleSection = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#0F1629]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden shadow-xl mb-4 transition-all">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-6 md:p-8 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left">
        <h2 className="text-xl font-black text-white flex items-center gap-3">
          <span className="text-indigo-400">{icon}</span>
          {title}
        </h2>
        <svg className={`w-6 h-6 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && <div className="px-6 md:px-8 pb-8 pt-0 border-t border-white/5 mt-2">{children}</div>}
    </div>
  );
};