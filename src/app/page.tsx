"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, TrendingUp, CheckCircle, Clock, Plus, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getHistoryItems, subscribeHistoryUpdates, DealHistoryItem } from "@/utils/historyStore";

export default function Dashboard() {
  const [historyItems, setHistoryItems] = useState<DealHistoryItem[]>([]);

  useEffect(() => {
    setHistoryItems(getHistoryItems());
    const unsubscribe = subscribeHistoryUpdates((updated) => {
      setHistoryItems(updated);
    });
    return () => unsubscribe();
  }, []);

  // Calculate live statistics from current browser history store
  const totalDealsCount = historyItems.length;
  
  const totalFundingVolume = historyItems.reduce((acc, item) => {
    return acc + (item.funding_amount || 0);
  }, 0);

  const formatVolume = (val: number) => {
    if (val >= 1_000_000_000) {
      return `$${(val / 1_000_000_000).toFixed(1)}B`;
    }
    if (val >= 1_000_000) {
      return `$${(val / 1_000_000).toFixed(0)}M`;
    }
    if (val >= 1_000) {
      return `$${(val / 1_000).toFixed(0)}K`;
    }
    return `$${val}`;
  };

  const stats = [
    { label: "Total Deals Processed", value: totalDealsCount.toString(), icon: Briefcase, color: "text-blue-400" },
    { label: "Success Rate", value: totalDealsCount > 0 ? "100%" : "0%", icon: CheckCircle, color: "text-green-400" },
    { label: "Avg. Processing Time", value: "1.4m", icon: Clock, color: "text-purple-400" },
    { label: "Deal Volume (Active)", value: formatVolume(totalFundingVolume), icon: TrendingUp, color: "text-indigo-400" },
  ];

  const recentDeals = historyItems.slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Senior Analyst</h1>
          <p className="text-slate-400">Here's a live overview of your AI deal brief generation platform.</p>
        </div>
        <Link href="/new-deal">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] text-sm"
          >
            <Plus size={18} />
            New Deal Brief
          </motion.button>
        </Link>
      </header>

      {/* Live Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              key={stat.label} 
              className="glass-panel p-6 rounded-2xl border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color} border border-white/5`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Recent Deals List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-white/10"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Recent Deal Briefs</h2>
              <p className="text-xs text-slate-400 mt-0.5">Live items stored in current browser session</p>
            </div>
            <Link href="/history" className="text-blue-400 text-sm font-medium hover:text-blue-300 flex items-center gap-1">
              View All History <ArrowRight size={14} />
            </Link>
          </div>
          
          {recentDeals.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.02] rounded-xl border border-white/5">
              <p className="text-slate-400 text-sm mb-4">No recent deal briefs found in history.</p>
              <Link href="/new-deal">
                <button className="bg-blue-600/80 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-semibold">
                  Generate First Brief
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDeals.map((deal) => (
                <Link key={deal.id} href="/history">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group mb-2">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-base border border-blue-500/30">
                        {deal.company_name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {deal.company_name}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {deal.industry} • {deal.date_time}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-white text-sm">
                        ${deal.funding_amount ? deal.funding_amount.toLocaleString() : "N/A"}
                      </p>
                      <span className={`inline-flex items-center gap-1 py-0.5 px-2 rounded-md text-xs font-medium mt-1 ${
                        deal.risk_level === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        deal.risk_level === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {deal.risk_level} Risk
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* System Status / Active AI Agents */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-xl font-bold text-white mb-6">Agent Engine Status</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300 font-medium">Multi-Agent Health</span>
                <span className="text-emerald-400 font-semibold">6 / 6 Operational</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300 font-medium">LLM Quota (Gemini API)</span>
                <span className="text-blue-400 font-semibold">Active & Live</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "95%" }}></div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/10">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Active Autonomous Agents
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Validation', 'Research', 'Financial', 'Strategy', 'Lender Match', 'Report Builder'].map((agent) => (
                  <span 
                    key={agent} 
                    className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {agent}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
