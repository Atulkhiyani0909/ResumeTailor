import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const AnalysisResultsView = ({ analysisResults }) => (
  <div className="flex flex-col gap-6 pt-4">
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Left Blueprint Column */}
      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <div className="bg-[#161E31]/50 rounded-xl p-4 border border-emerald-500/10">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-2 block">Direct Hits ({analysisResults.points_matched?.length || 0})</span>
            <div className="flex flex-wrap gap-1.5">
              {analysisResults.points_matched?.map((pt, i) => <span key={i} className="text-[11px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded">{pt}</span>)}
            </div>
          </div>
          <div className="bg-[#161E31]/50 rounded-xl p-4 border border-rose-500/10">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest mb-2 block">Missing Gaps ({analysisResults.missing_points?.length || 0})</span>
            <div className="flex flex-wrap gap-1.5">
              {analysisResults.missing_points?.map((pt, i) => <span key={i} className="text-[11px] bg-rose-500/10 text-rose-300 border border-rose-500/20 px-2 py-0.5 rounded">{pt}</span>)}
            </div>
          </div>
        </div>
        {analysisResults.summary_suggestion && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Target: Professional Summary</h4>
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-2 block">Optimized AI Draft</span>
              <p className="text-[13px] text-emerald-100/80 leading-relaxed">{analysisResults.summary_suggestion}</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Blueprint Column */}
      <div className="space-y-6">
        {analysisResults.experience_suggestion && analysisResults.experience_suggestion.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Target: Work Experience</h4>
            <div className="space-y-4">
              {analysisResults.experience_suggestion.map((sug, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="p-3 bg-[#161E31] border border-rose-500/10 rounded-lg">
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1 block">Original</span>
                      <p className="text-[12px] text-slate-400">{sug.original_text}</p>
                  </div>
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 block">Rewrite Injection</span>
                      <p className="text-[12px] text-emerald-100/80 font-medium">{sug.suggested_rewrite}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);