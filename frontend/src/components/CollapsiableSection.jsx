import { useState, useEffect } from 'react';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Show, SignUpButton } from '@clerk/react';



export const CollapsibleSection = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden flex flex-col mb-4 shadow-xl">
      <button onClick={() => setIsOpen(!isOpen)} className="bg-slate-800/30 px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3 text-left w-full hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-md">{icon}</div>
          <h3 className="font-bold text-white text-sm">{title}</h3>
        </div>
        <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && <div className="p-5 bg-[#0B0F19]">{children}</div>}
    </div>
  );
};