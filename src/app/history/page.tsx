"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  FileCheck 
} from "lucide-react";
import { 
  getHistoryItems, 
  deleteHistoryItem, 
  clearHistory, 
  subscribeHistoryUpdates, 
  DealHistoryItem 
} from "@/utils/historyStore";
import { HistorySearch } from "@/components/HistorySearch";
import { HistoryFilters, SortOption, RiskFilter } from "@/components/HistoryFilters";
import { HistoryList } from "@/components/HistoryList";
import { HistoryEmptyState } from "@/components/HistoryEmptyState";
import { HistoryModal } from "@/components/HistoryModal";

export default function HistoryPage() {
  const [items, setItems] = useState<DealHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [riskFilter, setRiskFilter] = useState<RiskFilter>("ALL");
  const [selectedItem, setSelectedItem] = useState<DealHistoryItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Sync with HistoryStore
  useEffect(() => {
    setItems(getHistoryItems());
    const unsubscribe = subscribeHistoryUpdates((newItems) => {
      setItems(newItems);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteItem = (id: string) => {
    deleteHistoryItem(id);
  };

  const handleConfirmClearAll = () => {
    clearHistory();
    setShowClearConfirm(false);
  };

  // Filter and Sort logic
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Search filter (Company Name or Industry)
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (item) =>
          item.company_name.toLowerCase().includes(query) ||
          item.industry.toLowerCase().includes(query)
      );
    }

    // Risk level filter
    if (riskFilter !== "ALL") {
      result = result.filter((item) => item.risk_level === riskFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return b.timestamp - a.timestamp;
      }
      if (sortBy === "oldest") {
        return a.timestamp - b.timestamp;
      }
      if (sortBy === "company_asc") {
        return a.company_name.localeCompare(b.company_name);
      }
      return 0;
    });

    return result;
  }, [items, searchTerm, sortBy, riskFilter]);

  // Derived statistics
  const totalCount = items.length;
  const lowRiskCount = items.filter((i) => i.risk_level === "Low").length;
  const mediumRiskCount = items.filter((i) => i.risk_level === "Medium").length;
  const highRiskCount = items.filter((i) => i.risk_level === "High").length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileCheck size={20} />
            </span>
            <h1 className="text-3xl font-bold text-white">History</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Previously Generated Deal Briefs
          </p>
        </div>

        {totalCount > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-semibold transition-colors"
          >
            <Trash2 size={14} />
            Clear History
          </button>
        )}
      </header>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Briefcase size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Reports Generated</p>
            <p className="text-2xl font-bold text-white mt-0.5">{totalCount}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Low Risk Deals</p>
            <p className="text-2xl font-bold text-white mt-0.5">{lowRiskCount}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Medium Risk Deals</p>
            <p className="text-2xl font-bold text-white mt-0.5">{mediumRiskCount}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert size={22} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">High Risk Deals</p>
            <p className="text-2xl font-bold text-white mt-0.5">{highRiskCount}</p>
          </div>
        </motion.div>
      </div>

      {/* Controls Bar: Search & Filters */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-white/10">
          <HistorySearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <HistoryFilters
            sortBy={sortBy}
            onSortChange={setSortBy}
            riskFilter={riskFilter}
            onRiskFilterChange={setRiskFilter}
          />
        </div>
      )}

      {/* Main Content Area */}
      {totalCount === 0 ? (
        <HistoryEmptyState />
      ) : filteredAndSortedItems.length === 0 ? (
        <HistoryEmptyState
          isSearchFiltered
          onClearSearch={() => {
            setSearchTerm("");
            setRiskFilter("ALL");
          }}
        />
      ) : (
        <HistoryList
          items={filteredAndSortedItems}
          onView={(item) => setSelectedItem(item)}
          onDelete={handleDeleteItem}
        />
      )}

      {/* Full Report View Modal */}
      <HistoryModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative w-full max-w-md bg-slate-900 border border-rose-500/30 rounded-3xl p-6 shadow-2xl z-10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Clear All History?</h3>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                This action will delete all previously generated Deal Briefs stored in this browser session. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClearAll}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-rose-600/20"
                >
                  Yes, Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
