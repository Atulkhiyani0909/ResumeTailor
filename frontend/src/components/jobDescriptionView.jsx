import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export const JobDescriptionView = ({ description }) => (
  <div className="prose prose-invert prose-sm md:prose-base max-w-none text-slate-300 leading-loose pt-4">
    <p className="whitespace-pre-wrap">{description}</p>
  </div>
);