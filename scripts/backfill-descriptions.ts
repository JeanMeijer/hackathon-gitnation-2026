import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";

// One-off backfill: fill title/company/description for known profiles.
const data: Record<string, { title: string; company: string; description: string }> = {
  Alice: {
    title: "Frontend Developer",
    company: "TechCorp",
    description: "Frontend engineer who loves clean UIs.",
  },
  Bob: {
    title: "Backend Developer",
    company: "DataWorks",
    description: "Backend developer and weekend hiker.",
  },
};

async function backfill() {
  const all = await db.select().from(profiles);

  let updated = 0;
  for (const profile of all) {
    const fields = data[profile.name];
    if (!fields) continue;
    await db.update(profiles).set(fields).where(eq(profiles.id, profile.id));
    updated++;
  }

  console.log(`Backfilled ${updated} profile(s).`);
  process.exit(0);
}

backfill().catch((err) => {
  console.error(err);
  process.exit(1);
});
