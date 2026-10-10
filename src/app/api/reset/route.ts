import { NextResponse } from "next/server";
import { resetTasksStore } from "@/lib/mockData";

export async function POST() {
  resetTasksStore();
  return NextResponse.json({ success: true, message: "Task store reset to 105 seeded records." });
}
