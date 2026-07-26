import { NextResponse } from "next/server";
import { getStoredDeal, generateFullDealReport } from "@/utils/dealBriefGenerator";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${backendUrl}/api/deals/${id}`, {
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // External backend offline or unavailable - fallback
  }

  const stored = getStoredDeal(id);
  if (stored) {
    return NextResponse.json(stored);
  }

  // Fallback for direct lookup
  const dummyInput = { company_name: "Enterprise Deal", industry: "Commercial", country: "USA" };
  return NextResponse.json({
    status: "complete",
    input: dummyInput,
    report: generateFullDealReport(dummyInput)
  });
}
