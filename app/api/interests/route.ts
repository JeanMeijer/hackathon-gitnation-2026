import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { interests } from "@/lib/db/schema";

export async function GET() {
  const all = await db.select().from(interests);
  return NextResponse.json(all);
}
