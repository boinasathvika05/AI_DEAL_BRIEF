import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  try {
    const res = await fetch(`${backendUrl}/api/deals/${id}/stream`);
    if (!res.ok || !res.body) {
      return NextResponse.json({ message: "Stream not found" }, { status: res.status });
    }
    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { message: "Backend server on port 8000 is offline." },
      { status: 503 }
    );
  }
}
