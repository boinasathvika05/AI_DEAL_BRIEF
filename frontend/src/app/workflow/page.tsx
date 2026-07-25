"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, ArrowRight } from "lucide-react";

const steps = [
  { id: "validation", label: "Validating Deal Input" },
  { id: "research", label: "Scraping Public Web & Live Intelligence" },
  { id: "financial", label: "Calculating Debt Ratios & Financials" },
  { id: "recommendation", label: "Structuring Financing Strategy" },
  { id: "lender", label: "Matching Lenders via Database" },
  { id: "report", label: "Compiling 18-Section Enterprise Brief" },
];

function WorkflowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dealId = searchParams.get("id");
  
  const [currentStep, setCurrentStep] = useState<string>("validation");
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dealId) return;

    const eventSource = new EventSource(`/api/deals/${dealId}/stream`);

    eventSource.addEventListener("progress", (e) => {
      const data = JSON.parse(e.data);
      if (data.status === "complete") {
        setCompletedSteps(prev => [...new Set([...prev, data.step])]);
      } else {
        setCurrentStep(data.step);
      }
    });

    eventSource.addEventListener("complete", (e) => {
      setIsComplete(true);
      setCompletedSteps(steps.map(s => s.id));
      eventSource.close();
    });

    eventSource.addEventListener("error", (e) => {
      let message = "An error occurred during processing.";
      try {
        if (e.data) {
          const data = JSON.parse(e.data);
          if (data.message) message = data.message;
        }
      } catch (err) {
        console.error("Could not parse error data:", err);
      }
      setError(message);
      eventSource.close();
    });

    eventSource.addEventListener("close", () => {
      eventSource.close();
    });

    return () => eventSource.close();
  }, [dealId]);

  if (!dealId) {
    return <div className="text-white">No Deal ID provided.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">Processing Deal Brief</h1>
        <p className="text-slate-400">Our multi-agent AI pipeline is analyzing the data...</p>
      </div>

      {error ? (
        <div className="glass-panel p-6 rounded-2xl border-red-500/30 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => router.push("/new-deal")}
            className="bg-red-500/20 text-red-300 hover:bg-red-500/30 px-6 py-2 rounded-xl"
          >
            Go Back
          </button>
        </div>
      ) : (
        <div className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
            <motion.div 
              className="h-full bg-blue-500"
              initial={{ width: "0%" }}
              animate={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <div className="space-y-8">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isActive = currentStep === step.id && !isCompleted;
              const isPending = !isActive && !isCompleted;

              return (
                <motion.div 
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 ${isPending ? "opacity-40" : "opacity-100"}`}
                >
                  <div className="relative">
                    {isCompleted ? (
                      <CheckCircle2 className="text-green-400" size={28} />
                    ) : isActive ? (
                      <Loader2 className="text-blue-400 animate-spin" size={28} />
                    ) : (
                      <Circle className="text-slate-600" size={28} />
                    )}
                    {index < steps.length - 1 && (
                      <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-6 ${isCompleted ? "bg-green-400/30" : "bg-slate-700"}`} />
                    )}
                  </div>
                  <div>
                    <h3 className={`font-semibold text-lg ${isCompleted ? "text-green-50" : isActive ? "text-blue-50" : "text-slate-400"}`}>
                      {step.label}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isCompleted ? "Completed" : isActive ? "In progress..." : "Waiting"}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {isComplete && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex justify-center"
            >
              <button 
                onClick={() => router.push(`/deal/${dealId}`)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
              >
                View Deal Brief <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkflowPage() {
  return (
    <Suspense fallback={<div className="text-white text-center py-20">Loading...</div>}>
      <WorkflowContent />
    </Suspense>
  );
}
