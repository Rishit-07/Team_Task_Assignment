import { NextRequest, NextResponse } from "next/server";
import { getSimulationConfig, updateSimulationConfig } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json(getSimulationConfig());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = updateSimulationConfig(body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Bad Request", message: "Invalid JSON configuration." },
      { status: 400 }
    );
  }
}
