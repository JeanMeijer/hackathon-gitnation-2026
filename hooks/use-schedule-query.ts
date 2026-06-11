import { useQuery } from "@tanstack/react-query";
import type { Talk, Track, Speaker } from "@/lib/db/interfaces";

export type TalkWithSpeakers = Talk & {
  speakers: Speaker[];
};

export type TrackWithTalks = Track & {
  talks: TalkWithSpeakers[];
};

export function useScheduleQuery() {
  return useQuery<TrackWithTalks[]>({
    queryKey: ["schedule"],
    queryFn: async () => {
      const response = await fetch("/api/schedule");

      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
      }
      
      return response.json();
    },
  });
}
