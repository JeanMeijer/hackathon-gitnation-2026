import { NextResponse } from "next/server";
import type { UserProfile } from "@/app/profile/profile-data";
import { getMockProfile, saveMockProfile } from "../mock-data";

export async function GET() {
  const profile = getMockProfile();

  if (!profile) {
    return NextResponse.json({ error: "No profile found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<UserProfile>;

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const profile = saveMockProfile({
    name,
    company: body.company?.trim() ?? "",
    descriptions: body.descriptions?.trim() ?? "",
    title: body.title?.trim() ?? "",
    interests: body.interests ?? [],
  });

  return NextResponse.json({ ok: true, profile });
}
