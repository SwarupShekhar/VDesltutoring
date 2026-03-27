import { NextResponse, NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    const secret = request.headers.get("x-internal-secret");
    if (secret !== process.env.INTERNAL_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clerkId, cefrLevel, fluencyScore } = body;

    if (!clerkId || !cefrLevel || typeof fluencyScore !== "number") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    // TODO: Implement database update logic
    console.log(`Would update CEFR for user ${clerkId}: ${cefrLevel} (${fluencyScore})`);

    return NextResponse.json({ status: "updated" });
  } catch (error) {
    console.error("Error updating CEFR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}