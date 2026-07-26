"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Building2, Globe, TrendingUp, Users, DollarSign, Send, AlertCircle, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  company_name: z.string().min(1, "Company Name is required"),
  website: z.string().optional().or(z.literal("")),
  industry: z.string().min(1, "Industry is required"),
  country: z.string().min(1, "Country is required"),
  revenue: z.coerce.number().optional(),
  ebitda: z.coerce.number().optional(),
  employees: z.coerce.number().optional(),
  funding_amount: z.coerce.number().optional(),
  funding_purpose: z.string().optional(),
  existing_debt: z.coerce.number().optional(),
  years_in_business: z.coerce.number().optional(),
  business_description: z.string().optional(),
  additional_notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewDeal() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      revenue: 0,
      ebitda: 0,
      employees: 1,
      funding_amount: 0,
      existing_debt: 0,
      years_in_business: 0,
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const targetUrl = baseUrl ? `${baseUrl}/api/deals` : "/api/deals";

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        let errorMsg = `Server error (${response.status})`;
        try {
          const errJson = await response.json();
          if (errJson.detail) {
            errorMsg = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
          } else if (errJson.message) {
            errorMsg = errJson.message;
          }
        } catch {
          // Ignore json parse error
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      router.push(`/workflow?id=${result.id}`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">New Deal Brief</h1>
        <p className="text-slate-400">Enter the company details below. Our AI agents will research, analyze, and generate a professional Deal Brief.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="glass-panel p-6 md:p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Building2 size={20} className="text-blue-400" />
            Company Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Company Name *</label>
              <input 
                {...register("company_name")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Acme Corp"
              />
              {errors.company_name && <p className="text-xs text-red-400">{errors.company_name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Website</label>
              <input 
                {...register("website")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="https://acme.com"
              />
              {errors.website && <p className="text-xs text-red-400">{errors.website.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Industry *</label>
              <input 
                {...register("industry")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="e.g. Software, Manufacturing"
              />
              {errors.industry && <p className="text-xs text-red-400">{errors.industry.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Country *</label>
              <input 
                {...register("country")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="e.g. USA, UK"
              />
              {errors.country && <p className="text-xs text-red-400">{errors.country.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Business Description *</label>
              <textarea 
                {...register("business_description")}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="What does the company do?"
              />
              {errors.business_description && <p className="text-xs text-red-400">{errors.business_description.message}</p>}
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-400" />
            Financials (in USD)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Revenue *</label>
              <input 
                type="number"
                {...register("revenue", { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {errors.revenue && <p className="text-xs text-red-400">{errors.revenue.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">EBITDA *</label>
              <input 
                type="number"
                {...register("ebitda", { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {errors.ebitda && <p className="text-xs text-red-400">{errors.ebitda.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Existing Debt *</label>
              <input 
                type="number"
                {...register("existing_debt", { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {errors.existing_debt && <p className="text-xs text-red-400">{errors.existing_debt.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Employees *</label>
              <input 
                type="number"
                {...register("employees", { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {errors.employees && <p className="text-xs text-red-400">{errors.employees.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Years in Business *</label>
              <input 
                type="number"
                {...register("years_in_business", { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {errors.years_in_business && <p className="text-xs text-red-400">{errors.years_in_business.message}</p>}
            </div>
          </div>
        </div>
        
        <div className="glass-panel p-6 md:p-8 rounded-2xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <DollarSign size={20} className="text-purple-400" />
            Funding Request
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Funding Amount Required (USD) *</label>
              <input 
                type="number"
                {...register("funding_amount", { valueAsNumber: true })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              {errors.funding_amount && <p className="text-xs text-red-400">{errors.funding_amount.message}</p>}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Funding Purpose *</label>
              <textarea 
                {...register("funding_purpose")}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="e.g. Working capital, acquisition, refinancing..."
              />
              {errors.funding_purpose && <p className="text-xs text-red-400">{errors.funding_purpose.message}</p>}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Additional Notes (Optional)</label>
              <textarea 
                {...register("additional_notes")}
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            disabled={isSubmitting}
            className={`px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all ${
              isSubmitting ? "bg-blue-600/50 cursor-not-allowed text-white/70" : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Initializing Agents...
              </>
            ) : (
              <>
                <Send size={18} />
                Generate Deal Brief
              </>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
