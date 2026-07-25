"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Printer, 
  FileText, 
  Copy, 
  CheckCircle, 
  Building2, 
  Calendar, 
  DollarSign, 
  Edit3, 
  AlertCircle,
  Link as LinkIcon,
  ShieldCheck
} from "lucide-react";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { DealHistoryItem } from "@/utils/historyStore";

interface HistoryModalProps {
  item: DealHistoryItem | null;
  onClose: () => void;
}

export function HistoryModal({ item, onClose }: HistoryModalProps) {
  const [copied, setCopied] = useState(false);
  const [analystNotes, setAnalystNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  if (!item) return null;

  const deal = item.full_report || {};
  const report = deal.report || {};
  const input = deal.input || { company_name: item.company_name, industry: item.industry, funding_amount: item.funding_amount };
  
  const currentNotes = analystNotes !== "" ? analystNotes : (report.analyst_notes || "");

  const handleCopyMarkdown = () => {
    const md = `# Deal Brief: ${item.company_name}\n\n## Executive Summary\n${report.executive_summary || item.report_summary}\n\n## Analyst Notes\n${currentNotes}`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDOCX = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: `Deal Brief: ${item.company_name}`, heading: HeadingLevel.TITLE }),
          new Paragraph({ text: `Industry: ${item.industry} | Date: ${item.date_time}` }),
          new Paragraph({ text: "1. Executive Summary", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: report.executive_summary || item.report_summary }),
          new Paragraph({ text: "2. Company Overview", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: report.company_overview || "N/A" }),
          new Paragraph({ text: "3. Business Analysis", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: report.business_analysis || "N/A" }),
          new Paragraph({ text: "4. Financial Highlights", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: report.financial_highlights || "N/A" }),
          new Paragraph({ text: "5. Risk Assessment", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: report.risk_assessment || "N/A" }),
          new Paragraph({ text: "Analyst Notes", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: currentNotes || "None" }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Deal_Brief_${item.company_name.replace(/\s+/g, '_')}.docx`);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
        >
          {/* Modal Header */}
          <div className="p-6 md:p-8 bg-slate-900/90 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 backdrop-blur-md z-20">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {item.company_name}
                </h2>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {item.industry}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <Calendar size={12} /> Generated: {item.date_time}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintPDF}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-blue-500/20"
              >
                <Printer size={14} /> Save PDF / Print
              </button>

              <button
                onClick={handleDownloadDOCX}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
              >
                <FileText size={14} /> DOCX
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors"
              >
                {copied ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={14} />} MD
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-2"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div ref={reportRef} className="flex-1 p-6 md:p-10 overflow-y-auto space-y-8 text-slate-300">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Funding Required</span>
                <span className="text-xl font-bold text-emerald-400">${item.funding_amount ? item.funding_amount.toLocaleString() : "N/A"}</span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Risk Profile</span>
                <span className={`text-xl font-bold ${
                  item.risk_level === 'Low' ? 'text-emerald-400' : item.risk_level === 'Medium' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {item.risk_level} Risk
                </span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Revenue</span>
                <span className="text-xl font-bold text-white">
                  ${input.revenue ? Number(input.revenue).toLocaleString() : "N/A"}
                </span>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5">
                <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">EBITDA</span>
                <span className="text-xl font-bold text-blue-400">
                  ${input.ebitda ? Number(input.ebitda).toLocaleString() : "N/A"}
                </span>
              </div>
            </div>

            {/* 1. Executive Summary */}
            <section className="space-y-3">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                <ShieldCheck size={20} className="text-blue-400" />
                1. Executive Summary
              </h3>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {report.executive_summary || item.report_summary}
              </p>
            </section>

            {/* 2. Company Overview & 3. Business Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-2">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">2. Company Overview</h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {report.company_overview || "Detailed company analysis generated based on public disclosure filings."}
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">3. Business Analysis</h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {report.business_analysis || "Competitive moat and market positioning evaluation."}
                </p>
              </section>
            </div>

            {/* 4. Recommended Debt Structure & 5. Lender Fit */}
            <section className="bg-blue-950/20 p-6 rounded-2xl border border-blue-500/20 space-y-4">
              <h3 className="text-xl font-bold text-blue-300">Financing Structure & Recommended Lenders</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {report.recommended_debt_structure || "Senior Term Loan combined with Working Capital Line."}
              </p>

              {report.recommended_lender_categories && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {report.recommended_lender_categories.map((cat: any, idx: number) => (
                    <div key={idx} className="bg-slate-800/60 p-4 rounded-xl border border-white/10 text-xs">
                      <div className="flex justify-between font-bold text-white mb-1">
                        <span>{cat.category_name}</span>
                        <span className="text-emerald-400">{cat.likelihood_of_approval} Approval</span>
                      </div>
                      <p className="text-slate-400">{cat.fit_explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Analyst Notes */}
            <section className="bg-slate-800/30 p-6 rounded-2xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 size={18} className="text-blue-400" />
                  Analyst Notes
                </h3>
                <button
                  onClick={() => setIsEditingNotes(!isEditingNotes)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  {isEditingNotes ? "Save Notes" : "Edit Notes"}
                </button>
              </div>

              {isEditingNotes ? (
                <textarea
                  value={currentNotes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAnalystNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows={4}
                  placeholder="Add analyst internal commentary..."
                />
              ) : (
                <p className="text-sm text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-white/5">
                  {currentNotes || "No internal analyst commentary added."}
                </p>
              )}
            </section>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
