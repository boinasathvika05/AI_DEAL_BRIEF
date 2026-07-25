"use client";

import { motion } from "framer-motion";
import { 
  Building2, 
  Calendar, 
  DollarSign, 
  Eye, 
  Download, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { DealHistoryItem } from "@/utils/historyStore";

interface HistoryCardProps {
  item: DealHistoryItem;
  onView: (item: DealHistoryItem) => void;
  onDelete: (id: string) => void;
}

export function HistoryCard({ item, onView, onDelete }: HistoryCardProps) {
  const getRiskBadge = (level: "Low" | "Medium" | "High") => {
    switch (level) {
      case "Low":
        return {
          bg: "bg-emerald-500/10",
          text: "text-emerald-400",
          border: "border-emerald-500/20",
          icon: ShieldCheck,
          label: "Low Risk"
        };
      case "Medium":
        return {
          bg: "bg-amber-500/10",
          text: "text-amber-400",
          border: "border-amber-500/20",
          icon: AlertTriangle,
          label: "Medium Risk"
        };
      case "High":
        return {
          bg: "bg-rose-500/10",
          text: "text-rose-400",
          border: "border-rose-500/20",
          icon: ShieldAlert,
          label: "High Risk"
        };
    }
  };

  const riskInfo = getRiskBadge(item.risk_level);
  const RiskIcon = riskInfo.icon;

  const handleDownloadDOCX = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const deal = item.full_report || {};
    const report = deal.report || {};
    const input = deal.input || {};

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: `Deal Brief: ${item.company_name}`, heading: HeadingLevel.TITLE }),
          new Paragraph({ text: `Industry: ${item.industry} | Generated: ${item.date_time}` }),
          new Paragraph({ text: "1. Executive Summary", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: report.executive_summary || item.report_summary }),
          new Paragraph({ text: "2. Company Overview", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: report.company_overview || "N/A" }),
          new Paragraph({ text: "3. Financial Highlights", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: report.financial_highlights || "N/A" }),
          new Paragraph({ text: "4. Risk Assessment", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: report.risk_assessment || "N/A" }),
          new Paragraph({ text: "Analyst Notes", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: report.analyst_notes || "No internal notes provided." }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Deal_Brief_${item.company_name.replace(/\s+/g, '_')}.docx`);
  };

  const handleDownloadPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(item);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all shadow-lg flex flex-col justify-between group"
    >
      <div>
        {/* Top bar with company & status */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-lg shadow-inner">
              {item.company_name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors line-clamp-1">
                {item.company_name}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Building2 size={12} className="text-slate-500" />
                {item.industry} {item.country ? `• ${item.country}` : ""}
              </p>
            </div>
          </div>

          {/* Generated Badge */}
          <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} />
            Generated
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 p-3 rounded-xl bg-slate-900/40 border border-white/5 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Funding Amount</span>
            <span className="font-bold text-white text-sm flex items-center gap-1">
              <DollarSign size={14} className="text-green-400 -mr-1" />
              {item.funding_amount ? item.funding_amount.toLocaleString() : "N/A"}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Risk Level</span>
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md border ${riskInfo.bg} ${riskInfo.text} ${riskInfo.border}`}>
              <RiskIcon size={12} />
              {riskInfo.label}
            </span>
          </div>
        </div>

        {/* Date & Time */}
        <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-3">
          <Calendar size={12} className="text-slate-500" />
          {item.date_time}
        </p>

        {/* Executive Summary Preview */}
        <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed mb-6 bg-white/[0.02] p-3 rounded-xl border border-white/5 italic">
          "{item.report_summary}"
        </p>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
        <button
          onClick={() => onView(item)}
          className="flex-1 bg-blue-600/90 hover:bg-blue-500 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-blue-500/20"
        >
          <Eye size={14} />
          View Report
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownloadPDF}
            title="Download PDF / Print"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
          >
            <Download size={14} />
          </button>

          <button
            onClick={handleDownloadDOCX}
            title="Download DOCX"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
          >
            <FileText size={14} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            title="Delete Report"
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-xl border border-rose-500/20 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
