import { db } from "@/lib/db";
import { talks } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const tracksWithTalks = await db.query.tracks.findMany({
    with: {
      talks: {
        orderBy: [asc(talks.startsAt)],
        with: {
          speakers: {
            with: {
              speaker: true,
            },
          },
        },
      },
    },
  });

  const schedule = tracksWithTalks.map((track) => ({
    ...track,
    talks: track.talks.map((talk) => ({
      ...talk,
      speakers: talk.speakers.map((ts) => ts.speaker),
    })),
  }));

  return Response.json(schedule);
}
