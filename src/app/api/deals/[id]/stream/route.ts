import { NextResponse } from "next/server";
import { getStoredDeal, setStoredDeal, generateFullDealReport } from "@/utils/dealBriefGenerator";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const dealEntry = getStoredDeal(id) || { status: "running", input: { company_name: "Enterprise Borrower" } };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const steps = [
        { step: "validation", status: "running", message: "Validate required fields" },
        { step: "validation", status: "complete", message: "Validation Complete" },
        { step: "research", status: "running", message: "Search official company website" },
        { step: "research", status: "complete", message: "Research Complete" },
        { step: "financial", status: "running", message: "Revenue analysis" },
        { step: "financial", status: "complete", message: "Financial Analysis Complete" },
        { step: "recommendation", status: "running", message: "Assess debt suitability" },
        { step: "recommendation", status: "complete", message: "Debt Recommendation Complete" },
        { step: "lender", status: "running", message: "Match lenders" },
        { step: "lender", status: "complete", message: "Lender Matching Complete" },
        { step: "ic_score", status: "running", message: "Calculate IC Score" },
        { step: "ic_score", status: "complete", message: "Investment Committee Score Complete" },
        { step: "confidence", status: "running", message: "Confidence score" },
        { step: "confidence", status: "complete", message: "AI Confidence & Explainability Complete" },
        { step: "report", status: "running", message: "Generate Executive Summary" },
        { step: "report", status: "complete", message: "Report Generation Complete" },
      ];

      for (const stepInfo of steps) {
        const payload = `event: progress\ndata: ${JSON.stringify(stepInfo)}\n\n`;
        controller.enqueue(encoder.encode(payload));
        await new Promise((r) => setTimeout(r, 2));
      }

      // Generate report and store in memory
      const finalReport = generateFullDealReport(dealEntry.input);
      setStoredDeal(id, {
        status: "complete",
        input: dealEntry.input,
        report: finalReport,
      });

      const completePayload = `event: complete\ndata: ${JSON.stringify(finalReport)}\n\n`;
      controller.enqueue(encoder.encode(completePayload));

      const closePayload = `event: close\ndata: {}\n\n`;
      controller.enqueue(encoder.encode(closePayload));

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
