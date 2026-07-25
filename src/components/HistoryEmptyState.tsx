"use client";

import { motion } from "framer-motion";
import { FilePlus, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

interface HistoryEmptyStateProps {
  isSearchFiltered?: boolean;
  onClearSearch?: () => void;
}

export function HistoryEmptyState({ isSearchFiltered, onClearSearch }: HistoryEmptyStateProps) {
  if (isSearchFiltered) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-12 rounded-3xl text-center max-w-md mx-auto my-12 border border-white/10"
      >
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
          <FileText size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Matching Briefs Found</h3>
        <p className="text-sm text-slate-400 mb-6">
          No deal briefs matched your search criteria. Try refining your keywords or clear filters.
        </p>
        {onClearSearch && (
          <button
            onClick={onClearSearch}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-700 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-12 md:p-16 rounded-3xl text-center max-w-xl mx-auto my-12 border border-white/10 relative overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600/20 to-indigo-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/10">
        <Sparkles size={36} />
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">
        No Deal Briefs Generated Yet
      </h3>

      <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
        Start analyzing potential acquisitions or financing requests with our multi-agent AI pipeline. Generated briefs will automatically be saved here.
      </p>

      <Link href="/new-deal">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold inline-flex items-center gap-2 shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all"
        >
          <FilePlus size={20} />
          Generate Your First Report
        </motion.button>
      </Link>
    </motion.div>
  );
}
