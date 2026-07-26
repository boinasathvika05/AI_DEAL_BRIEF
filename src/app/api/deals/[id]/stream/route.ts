import { NextResponse } from "next/server";
import { getStoredDeal, setStoredDeal, generateFullDealReport } from "@/utils/dealBriefGenerator";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const dealEntry = getStoredDeal(id) || { status: "running", input: { company_name: "Enterprise Borrower" } };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const steps = [
        { step: "validation", status: "running", message: "Validating Input..." },
        { step: "validation", status: "complete", message: "Validation Complete" },
        { step: "research", status: "running", message: "Scraping Public Web & Gathering Live Intelligence..." },
        { step: "research", status: "complete", message: "Live Research Complete" },
        { step: "financial", status: "running", message: "Calculating Debt Ratios & Financial Health..." },
        { step: "financial", status: "complete", message: "Financial Analysis Complete" },
        { step: "recommendation", status: "running", message: "Structuring Financing Strategy..." },
        { step: "recommendation", status: "complete", message: "Financing Strategy Complete" },
        { step: "lender", status: "running", message: "Matching Lenders via Database..." },
        { step: "lender", status: "complete", message: "Lender Matching Complete" },
        { step: "report", status: "running", message: "Compiling 18-Section Enterprise Deal Brief..." },
        { step: "report", status: "complete", message: "Deal Brief Generated" },
      ];

      for (const stepInfo of steps) {
        const payload = `event: progress\ndata: ${JSON.stringify(stepInfo)}\n\n`;
        controller.enqueue(encoder.encode(payload));
        await new Promise((r) => setTimeout(r, 10));
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
