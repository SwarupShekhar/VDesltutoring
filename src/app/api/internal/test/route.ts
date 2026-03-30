import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Test route works" });
}

export async function PATCH() {
  return NextResponse.json({ message: "PATCH test route works" });
}
