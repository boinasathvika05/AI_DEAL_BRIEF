"use client";

import { ArrowUpDown, Filter } from "lucide-react";

export type SortOption = "newest" | "oldest" | "company_asc";
export type RiskFilter = "ALL" | "Low" | "Medium" | "High";

interface HistoryFiltersProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  riskFilter: RiskFilter;
  onRiskFilterChange: (risk: RiskFilter) => void;
}

export function HistoryFilters({
  sortBy,
  onSortChange,
  riskFilter,
  onRiskFilterChange
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sorting Dropdown */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-300">
        <ArrowUpDown size={14} className="text-blue-400" />
        <span className="text-slate-400 font-medium hidden sm:inline">Sort:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
        >
          <option value="newest" className="bg-slate-900 text-white">Newest First</option>
          <option value="oldest" className="bg-slate-900 text-white">Oldest First</option>
          <option value="company_asc" className="bg-slate-900 text-white">Company Name (A-Z)</option>
        </select>
      </div>

      {/* Risk Filter Pills */}
      <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl text-xs">
        <Filter size={14} className="text-slate-400 ml-2 mr-1 hidden sm:inline" />
        {(["ALL", "Low", "Medium", "High"] as RiskFilter[]).map((risk) => (
          <button
            key={risk}
            onClick={() => onRiskFilterChange(risk)}
            className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              riskFilter === risk
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
          >
            {risk === "ALL" ? "All Risk" : risk}
          </button>
        ))}
      </div>
    </div>
  );
}
