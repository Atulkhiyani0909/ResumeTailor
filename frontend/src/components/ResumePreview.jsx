import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const ResumePreview = ({ fixedResume }) => (
  <div className="w-full overflow-x-auto pb-4 custom-scrollbar mt-4 animate-[fadeIn_0.5s_ease-out]">
    <div id="resume-preview" className="bg-white text-slate-900 p-10 md:p-14 rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] min-h-[1056px] w-[816px] mx-auto font-serif">
      <div className="text-center border-b-2 border-slate-800 pb-5 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900 mb-2">Tailored Resume</h1>
        <p className="text-sm text-slate-600 font-sans break-words whitespace-pre-wrap">{fixedResume.contact_details || "Contact info pending..."}</p>
      </div>
      {fixedResume.summary && (
        <div className="mb-6">
          <h2 className="text-[13px] font-bold border-b border-slate-300 mb-2.5 uppercase tracking-widest text-slate-800">Professional Summary</h2>
          <p className="text-[13px] leading-relaxed text-slate-700">{fixedResume.summary}</p>
        </div>
      )}
      {fixedResume.hard_skills && fixedResume.hard_skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[13px] font-bold border-b border-slate-300 mb-2.5 uppercase tracking-widest text-slate-800">Core Competencies</h2>
          <div className="flex flex-wrap gap-1.5">
            {fixedResume.hard_skills.map((skill, i) => (
              <span key={i} className="text-[12px] bg-slate-100 font-sans font-semibold text-slate-700 px-2 py-0.5 rounded border border-slate-200">{skill}</span>
            ))}
          </div>
        </div>
      )}
      {fixedResume.experience && fixedResume.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[13px] font-bold border-b border-slate-300 mb-3.5 uppercase tracking-widest text-slate-800">Work Experience</h2>
          {fixedResume.experience.map((exp, i) => (
            <div key={i} className="mb-5">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-[14px] font-bold text-slate-900">{exp.role}</h3>
                <span className="text-[12px] font-semibold text-slate-600 font-sans whitespace-nowrap">{exp.period || (exp.is_current ? 'Present' : '')}</span>
              </div>
              <div className="text-[13px] text-slate-600 italic mb-2">{exp.company}</div>
              <ul className="list-disc ml-5 space-y-1.5 text-[13px] text-slate-700 leading-relaxed">
                {exp.bullets?.map((b, j) => <li key={j} className="pl-1">{b.text}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {fixedResume.projects && fixedResume.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[13px] font-bold border-b border-slate-300 mb-3.5 uppercase tracking-widest text-slate-800">Key Projects</h2>
          {fixedResume.projects.map((proj, i) => (
            <div key={i} className="mb-5">
              <div className="flex items-baseline gap-2 mb-1">
                <h3 className="text-[14px] font-bold text-slate-900">{proj.name}</h3>
                <span className="text-[12px] text-slate-500 font-sans italic">| {proj.type_of_project}</span>
              </div>
              <p className="text-[13px] text-slate-700 mb-2 leading-relaxed">{proj.description}</p>
              <ul className="list-disc ml-5 space-y-1.5 text-[13px] text-slate-700 leading-relaxed">
                {proj.key_achievements?.map((achieve, j) => <li key={j} className="pl-1">{achieve}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {fixedResume.education_details && fixedResume.education_details.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[13px] font-bold border-b border-slate-300 mb-3.5 uppercase tracking-widest text-slate-800">Education</h2>
          <ul className="list-disc ml-5 space-y-1.5 text-[13px] text-slate-700 leading-relaxed">
            {fixedResume.education_details.map((edu, i) => <li key={i} className="pl-1">{edu}</li>)}
          </ul>
        </div>
      )}
    </div>
  </div>
);