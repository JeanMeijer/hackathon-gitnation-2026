import { NextResponse } from "next/server";
import { inArray } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { interests, profileInterests, profiles } from "@/lib/db/schema";
import type { UserProfile } from "@/app/profile/profile-data";

export async function GET() {
  const profile = await db.query.profiles.findFirst({
    with: {
      interests: {
        with: { interest: true },
      },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "No profile found" }, { status: 404 });
  }

  const result: UserProfile = {
    name: profile.name,
    company: profile.company ?? "",
    title: profile.title ?? "",
    descriptions: profile.description ?? "",
    interests: profile.interests.map((pi) => pi.interest.name),
    interestTypes: Object.fromEntries(
      profile.interests.map((pi) => [pi.interest.name, pi.interest.type]),
    ),
  };

  return NextResponse.json(result);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<UserProfile>;

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const fields = {
    name,
    title: body.title?.trim() || null,
    company: body.company?.trim() || null,
    description: body.descriptions?.trim() || null,
  };

  // Upsert the single "current" profile (first row, or insert if none).
  const existing = await db.select().from(profiles).limit(1);
  let profileId: number;
  if (existing.length > 0) {
    profileId = existing[0].id;
    await db.update(profiles).set(fields).where(eq(profiles.id, profileId));
  } else {
    const inserted = await db.insert(profiles).values(fields).returning();
    profileId = inserted[0].id;
  }

  // Resync M2M interest links. Only interests that exist in the DB are linked
  // (form is restricted to the known list, so custom values are ignored).
  const names = [...new Set(body.interests ?? [])].filter(Boolean);
  const matched = names.length
    ? await db.select().from(interests).where(inArray(interests.name, names))
    : [];

  await db
    .delete(profileInterests)
    .where(eq(profileInterests.profileId, profileId));

  if (matched.length > 0) {
    await db.insert(profileInterests).values(
      matched.map((interest) => ({
        profileId,
        interestId: interest.id,
      })),
    );
  }

  return NextResponse.json({ ok: true, id: profileId });
}
