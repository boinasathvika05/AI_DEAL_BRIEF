import { NextResponse } from "next/server";
import { setStoredDeal } from "@/utils/dealBriefGenerator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dealId = typeof crypto !== "undefined" && crypto.randomUUID 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2, 15);
    
    setStoredDeal(dealId, {
      status: "running",
      input: body
    });

    return NextResponse.json({ id: dealId });
  } catch (err: any) {
    return NextResponse.json({ message: "Invalid deal submission payload" }, { status: 400 });
  }
}
