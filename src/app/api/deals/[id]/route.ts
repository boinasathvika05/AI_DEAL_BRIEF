import { NextResponse } from "next/server";
import { getStoredDeal, generateFullDealReport } from "@/utils/dealBriefGenerator";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const stored = getStoredDeal(id);

  if (stored) {
    return NextResponse.json(stored);
  }

  const defaultInput = { company_name: "Enterprise Borrower", industry: "Commercial", country: "USA" };
  return NextResponse.json({
    status: "complete",
    input: defaultInput,
    report: generateFullDealReport(defaultInput)
  });
}
