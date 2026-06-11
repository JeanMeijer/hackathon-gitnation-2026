import { eq } from "drizzle-orm";
import { db } from "./db";
import { profiles } from "./db/schema";

export async function getProfiles() {
  return db.select().from(profiles);
}

export async function getProfileById(id: number) {
  const result = await db.select().from(profiles).where(eq(profiles.id, id));
  return result[0] ?? null;
}

export async function createProfile(name: string) {
  const result = await db.insert(profiles).values({ name }).returning();
  return result[0];
}
