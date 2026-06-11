import { NextResponse } from "next/server";
import { mockInterests } from "../mock-data";

export async function GET() {
  return NextResponse.json(mockInterests);
}
