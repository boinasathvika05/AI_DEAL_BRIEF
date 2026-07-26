import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  try {
    const res = await fetch(`${backendUrl}/api/deals/${id}`);
    if (!res.ok) {
      return NextResponse.json({ message: "Deal not found" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { message: "Backend server on port 8000 is offline." },
      { status: 503 }
    );
  }
}
