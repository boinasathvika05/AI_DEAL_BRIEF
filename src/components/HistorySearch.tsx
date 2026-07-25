"use client";

import { Search, X } from "lucide-react";

interface HistorySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function HistorySearch({ searchTerm, onSearchChange }: HistorySearchProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by Company Name or Industry..."
        className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
      />
      {searchTerm && (
        <button
          onClick={() => onSearchChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
