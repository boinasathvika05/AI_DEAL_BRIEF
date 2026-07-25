"use client";

import { motion } from "framer-motion";
import { ArrowRight, Briefcase, TrendingUp, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const stats = [
    { label: "Total Deals Processed", value: "124", icon: Briefcase, color: "text-blue-400" },
    { label: "Success Rate", value: "98%", icon: CheckCircle, color: "text-green-400" },
    { label: "Avg. Processing Time", value: "14m", icon: Clock, color: "text-purple-400" },
    { label: "Deal Volume (YTD)", value: "$4.2B", icon: TrendingUp, color: "text-indigo-400" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Sarah</h1>
          <p className="text-slate-400">Here's an overview of your AI deal brief generation platform.</p>
        </div>
        <Link href="/new-deal">
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Briefcase size={18} />
            New Deal Brief
          </button>
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={stat.label} 
              className="glass-panel p-6 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass-panel rounded-2xl p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Recent Deals</h2>
            <Link href="/history" className="text-blue-400 text-sm font-medium hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {[
              { company: "TechFlow Solutions", industry: "SaaS", amount: "$15M", status: "Completed", date: "Today, 2:30 PM" },
              { company: "Apex Manufacturing", industry: "Industrials", amount: "$45M", status: "Completed", date: "Yesterday" },
              { company: "Nova Health", industry: "Healthcare", amount: "$120M", status: "Completed", date: "Jul 22, 2026" },
              { company: "EcoEnergy Group", industry: "Renewables", amount: "$85M", status: "Completed", date: "Jul 20, 2026" },
            ].map((deal, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    {deal.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{deal.company}</h3>
                    <p className="text-xs text-slate-400">{deal.industry} • {deal.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{deal.amount}</p>
                  <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-xs font-medium bg-green-500/10 text-green-400 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    {deal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-6">System Status</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Agents Online</span>
                <span className="text-green-400 font-medium">6 / 6</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">API Quota</span>
                <span className="text-yellow-400 font-medium">82%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "82%" }}></div>
              </div>
            </div>
            
            <div className="pt-4 mt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Active Agents</h3>
              <div className="flex flex-wrap gap-2">
                {['Validation', 'Research', 'Financial', 'Strategy', 'Lender', 'Report'].map(agent => (
                  <span key={agent} className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-slate-300">
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
