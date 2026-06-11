import { db } from "@/lib/db";
import { interests, profileInterests, profiles } from "@/lib/db/schema";

async function seed() {
  // Idempotent: only seed when profiles table is empty. Never deletes existing data.
  const existing = await db.select().from(profiles).limit(1);
  if (existing.length > 0) {
    console.log("Profiles already exist — skipping seed.");
    process.exit(0);
  }

  const insertedInterests = await db
    .insert(interests)
    .values([
      { name: "React", type: "tech" },
      { name: "TypeScript", type: "tech" },
      { name: "Databases", type: "tech" },
      { name: "Music", type: "non_tech" },
      { name: "Hiking", type: "non_tech" },
    ])
    .returning();

  const insertedProfiles = await db
    .insert(profiles)
    .values([
      {
        name: "Alice",
        title: "Frontend Developer",
        company: "TechCorp",
        description: "Frontend engineer who loves clean UIs.",
      },
      {
        name: "Bob",
        title: "Backend Developer",
        company: "DataWorks",
        description: "Backend developer and weekend hiker.",
      },
    ])
    .returning();

  await db.insert(profileInterests).values([
    { profileId: insertedProfiles[0].id, interestId: insertedInterests[0].id },
    { profileId: insertedProfiles[0].id, interestId: insertedInterests[1].id },
    { profileId: insertedProfiles[0].id, interestId: insertedInterests[3].id },
    { profileId: insertedProfiles[1].id, interestId: insertedInterests[2].id },
    { profileId: insertedProfiles[1].id, interestId: insertedInterests[4].id },
  ]);

  console.log(
    `Seeded ${insertedProfiles.length} profiles, ${insertedInterests.length} interests.`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
