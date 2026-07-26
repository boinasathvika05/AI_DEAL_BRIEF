import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

    const res = await fetch(`${backendUrl}/api/deals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { message: `Backend error (${res.status}): ${errText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { message: "Backend server on port 8000 is offline. Please start Python backend with: cd backend && python -m uvicorn main:app --port 8000" },
      { status: 503 }
    );
  }
}
