import { NextResponse } from "next/server";
import { SEEDED_ASSIGNEES } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json(SEEDED_ASSIGNEES);
}
