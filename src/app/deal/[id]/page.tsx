"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Download, Copy, Printer, FileText, CheckCircle, AlertCircle, Link as LinkIcon, Edit3 } from "lucide-react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { saveHistoryItem } from "@/utils/historyStore";

import { generateFullDealReport } from "@/utils/dealBriefGenerator";

export default function DealViewer() {
  const { id } = useParams();
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [analystNotes, setAnalystNotes] = useState("");
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDeal = async () => {
      try {
        let data: any = null;
        const res = await fetch(`/api/deals/${id}`);
        if (res.ok) {
          data = await res.json();
        }

        // Always check localStorage for exact user submitted inputs to ensure 100% data fidelity on Vercel
        if (typeof window !== "undefined" && id) {
          const localInputStr = localStorage.getItem(`deal_input_${id}`);
          if (localInputStr) {
            try {
              const localInput = JSON.parse(localInputStr);
              if (localInput && localInput.company_name) {
                const clientReport = generateFullDealReport(localInput);
                data = {
                  status: "complete",
                  input: localInput,
                  report: clientReport
                };
              }
            } catch (e) {
              console.error("Local storage parse error:", e);
            }
          }
        }

        if (data) {
          setDeal(data);
          if (data?.status === "complete") {
            saveHistoryItem(data);
          }
          if (data?.report?.analyst_notes) {
            setAnalystNotes(data.report.analyst_notes);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDeal();
  }, [id]);

  const handleCopyMarkdown = () => {
    if (!deal?.report) return;
    const md = generateMarkdown(deal.report);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDOCX = async () => {
    if (!deal?.report) return;
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: "Deal Brief: " + (deal?.input?.company_name || "Report"), heading: HeadingLevel.TITLE }),
          new Paragraph({ text: "Executive Summary", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: deal.report.executive_summary }),
          new Paragraph({ text: "Company Overview", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: deal.report.company_overview }),
          // A full implementation would map all 18 sections here
          new Paragraph({ text: "Analyst Notes", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: analystNotes }),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Deal_Brief_${deal?.input?.company_name || 'Report'}.docx`);
  };

  const generateMarkdown = (report: any) => {
    return `# Deal Brief\n\n## Executive Summary\n${report.executive_summary}\n\n## Analyst Notes\n${analystNotes}`;
  };

  if (loading) return <div className="text-white text-center py-20 flex flex-col items-center gap-4"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>Loading Enterprise Deal Brief...</div>;
  if (!deal || deal.status !== "complete") return <div className="text-white text-center py-20">Report not found or not complete.</div>;

  const { report, input } = deal;
  const confidenceScore = Math.round((report?.ai_confidence_score || 0) * 100);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8 bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{input?.company_name || 'Unknown Company'}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Industry: {input?.industry || 'Unknown'}</span>
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Requested: ${input?.funding_amount?.toLocaleString() || '0'}</span>
            <span className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Country: {input?.country}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-4">
          {/* Confidence Gauge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">AI Confidence</p>
              <p className="text-2xl font-bold text-white">{confidenceScore}%</p>
            </div>
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-slate-800">
              <svg viewBox="0 0 64 64" className="w-16 h-16 transform -rotate-90 overflow-visible">
                <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-700" />
                <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="6" fill="transparent"
                  strokeDasharray="163" strokeDashoffset={163 - (163 * confidenceScore) / 100}
                  className={confidenceScore > 80 ? "text-green-500" : confidenceScore > 50 ? "text-yellow-500" : "text-red-500"} 
                  strokeLinecap="round" />
              </svg>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <button onClick={handleDownloadDOCX} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors text-white shadow-lg shadow-blue-500/20">
              <FileText size={16} /> DOCX
            </button>
            <button onClick={handleCopyMarkdown} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-sm font-medium transition-colors text-white">
              {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />} MD
            </button>
          </div>
        </div>
      </header>

      <div ref={reportRef} className="glass-panel p-8 md:p-12 rounded-2xl text-slate-200 print:shadow-none print:bg-white print:text-black print:p-0">
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body { background: white !important; }
            body * { visibility: hidden; }
            .print\\:shadow-none, .print\\:shadow-none * { visibility: visible; }
            .print\\:shadow-none { position: absolute; left: 0; top: 0; width: 100%; color: black !important; }
            h1, h2, h3, h4, h5, h6 { color: #0f172a !important; break-after: avoid; }
            p, span, li, div { color: #334155 !important; }
            .print-border { border-color: #cbd5e1 !important; }
          }
        `}} />
        
        <div className="space-y-12">
          
          <section>
            <h2 className="text-3xl font-bold text-white mb-6 pb-2 border-b border-white/10 print-border">1. Executive Summary</h2>
            <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap">{report.executive_summary}</p>
          </section>
          
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 print-border">2. Company Overview</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{report.company_overview}</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 print-border">3. Business Analysis</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{report.business_analysis}</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 print-border">4. Industry Analysis</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{report.industry_analysis}</p>
          </section>
          
          <section className="bg-slate-900/50 p-8 rounded-xl border border-white/10 print-border">
            <h2 className="text-2xl font-bold text-white mb-6">5. Financial Highlights</h2>
            <p className="text-slate-300 leading-relaxed mb-6">{report.financial_highlights}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-slate-800/80 p-4 rounded-lg border border-white/5 print-border">
                <p className="text-sm text-slate-400 mb-1 uppercase tracking-wider">Revenue</p>
                <p className="text-2xl font-bold text-emerald-400">${input.revenue.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-lg border border-white/5 print-border">
                <p className="text-sm text-slate-400 mb-1 uppercase tracking-wider">EBITDA</p>
                <p className="text-2xl font-bold text-emerald-400">${input.ebitda.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-lg border border-white/5 print-border">
                <p className="text-sm text-slate-400 mb-1 uppercase tracking-wider">Existing Debt</p>
                <p className="text-2xl font-bold text-red-400">${input.existing_debt.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800/80 p-4 rounded-lg border border-white/5 print-border">
                <p className="text-sm text-slate-400 mb-1 uppercase tracking-wider">Requested</p>
                <p className="text-2xl font-bold text-blue-400">${input.funding_amount.toLocaleString()}</p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 print-border">6. Funding Requirement</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{report.funding_requirement}</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 print-border">7. Financing Requirement</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{report.financing_requirement}</p>
            </div>
          </section>

          <section className="bg-blue-900/20 p-8 rounded-xl border border-blue-500/20 print-border">
            <h2 className="text-2xl font-bold text-blue-300 mb-6">Financing Strategy & Structure</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-white mb-2">8. Recommended Debt Structure</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{report.recommended_debt_structure}</p>
                
                <h3 className="text-lg font-semibold text-white mb-2 mt-6">10. Repayment Recommendation</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{report.repayment_recommendation}</p>
              </div>
              <div className="bg-slate-900/50 p-6 rounded-lg border border-white/10 print-border h-fit">
                <h3 className="text-lg font-semibold text-white mb-4">9. Loan Structure Details</h3>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{report.loan_structure}</p>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 pb-2 border-b border-white/10 print-border">11. Suggested Lender Categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {report.recommended_lender_categories?.map((lender: any, i: number) => (
                <div key={i} className="border border-white/10 rounded-xl p-6 bg-slate-800/40 print-border relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${
                      lender.likelihood_of_approval === 'High' ? 'bg-green-500' :
                      lender.likelihood_of_approval === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-white">{lender.category_name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      lender.likelihood_of_approval === 'High' ? 'bg-green-500/20 text-green-300' :
                      lender.likelihood_of_approval === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {lender.likelihood_of_approval} Approval
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">{lender.fit_explanation}</p>
                </div>
              ))}
            </div>
          </section>
          
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4 pb-2 border-b border-white/10 print-border">12. Risk Assessment</h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{report.risk_assessment}</p>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <CheckCircle size={18} className="text-emerald-400" /> 13. Key Strengths
                </h3>
                <ul className="space-y-2">
                  {report.strengths?.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400 mt-1 text-xs">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <AlertCircle size={18} className="text-red-400" /> 14. Potential Concerns
                </h3>
                <ul className="space-y-2">
                  {report.potential_concerns?.map((r: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-red-400 mt-1 text-xs">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-slate-800/30 p-8 rounded-xl border border-white/5 print-border group relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Edit3 size={20} className="text-blue-400" /> 17. Analyst Notes
              </h2>
              <button 
                onClick={() => setIsEditingNotes(!isEditingNotes)} 
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors print:hidden"
              >
                {isEditingNotes ? 'Done Editing' : 'Edit Notes'}
              </button>
            </div>
            
            {isEditingNotes ? (
              <textarea 
                value={analystNotes}
                onChange={(e) => setAnalystNotes(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700 rounded-lg p-4 text-slate-200 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add your subjective analyst notes, contingencies, or next steps here..."
              />
            ) : (
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap p-4 bg-slate-900/40 rounded-lg min-h-[100px]">
                {analystNotes || "No internal analyst notes added."}
              </p>
            )}
          </section>
          
          <section className="pt-8 border-t border-white/10 print-border">
            <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
              <LinkIcon size={18} /> 15. Research Sources
            </h2>
            <div className="flex flex-wrap gap-2">
              {report.sources?.map((source: string, idx: number) => {
                const isUrl = source.startsWith('http');
                return isUrl ? (
                  <a key={idx} href={source} target="_blank" rel="noreferrer" className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-300 px-3 py-1.5 rounded-full border border-slate-700 transition-colors truncate max-w-[300px]">
                    {new URL(source).hostname}
                  </a>
                ) : (
                  <span key={idx} className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">
                    {source}
                  </span>
                );
              })}
            </div>
          </section>

          <section className="text-xs text-slate-500 text-center pt-12">
            <p><strong>18. Disclaimer:</strong> {report.disclaimer}</p>
          </section>

        </div>
      </div>
    </div>
  );
}
