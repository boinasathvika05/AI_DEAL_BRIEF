import { NextResponse } from "next/server";
import { setStoredDeal } from "@/utils/dealBriefGenerator";

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    // Attempt external backend first
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${backendUrl}/api/deals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err: any) {
    // External backend offline or unavailable - fallback seamlessly
  }

  // Self-contained fallback execution
  const dealId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
  setStoredDeal(dealId, {
    status: "running",
    input: body
  });

  return NextResponse.json({ id: dealId });
}
