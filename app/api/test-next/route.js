import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const batch = await req.json();
    console.log("📦 Received batch:", batch);

    // Simulate some processing (e.g., saving to DB)
    await new Promise((r) => setTimeout(r, 5000));

    return NextResponse.json({
      message: "Batch processed successfully! 1",
      count: batch.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON or server error" },
      { status: 400 }
    );
  }
}