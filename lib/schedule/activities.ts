import type { ScheduleEvent, ScheduleEventType } from "./types";

export interface PredefinedActivity {
  id: string;
  title: string;
  type: ScheduleEventType;
  durationMinutes: number;
  talkId?: number;
  trackName?: string;
  location?: string;
  description?: string;
}

export const PREDEFINED_ACTIVITIES: PredefinedActivity[] = [
  {
    id: "talk-rsc",
    type: "talk",
    title: "React Server Components Deep Dive",
    durationMinutes: 45,
    talkId: 101,
    trackName: "Main Stage",
  },
  {
    id: "talk-ts6",
    type: "talk",
    title: "TypeScript 6: What's New",
    durationMinutes: 45,
    talkId: 205,
    trackName: "Track 2",
  },
  {
    id: "talk-supabase",
    type: "talk",
    title: "Building Real-time Apps with Supabase",
    durationMinutes: 45,
    talkId: 310,
    trackName: "Main Stage",
  },
  {
    id: "talk-keynote",
    type: "talk",
    title: "Keynote: Future of Web Development",
    durationMinutes: 60,
    talkId: 401,
    trackName: "Main Stage",
  },
  {
    id: "talk-panel",
    type: "talk",
    title: "Panel: State Management in 2026",
    durationMinutes: 45,
    talkId: 402,
    trackName: "Track 2",
  },
  {
    id: "meeting-design",
    type: "meeting",
    title: "Sync with design team",
    durationMinutes: 30,
    location: "Room B",
  },
  {
    id: "meeting-standup",
    type: "meeting",
    title: "Hackathon team standup",
    durationMinutes: 30,
    location: "Team table 7",
  },
  {
    id: "meeting-mentor",
    type: "meeting",
    title: "1:1 with mentor",
    durationMinutes: 30,
    location: "Mentor lounge",
  },
  {
    id: "meeting-sponsor",
    type: "meeting",
    title: "Sponsor booth visit",
    durationMinutes: 20,
    location: "Expo hall",
  },
  {
    id: "break-coffee",
    type: "break",
    title: "Coffee break",
    durationMinutes: 30,
    location: "Lobby",
  },
  {
    id: "break-lunch",
    type: "break",
    title: "Lunch break",
    durationMinutes: 60,
    location: "Food court",
  },
  {
    id: "break-afternoon",
    type: "break",
    title: "Afternoon break",
    durationMinutes: 30,
    location: "Expo hall",
  },
  {
    id: "break-networking",
    type: "break",
    title: "Networking break",
    durationMinutes: 30,
    location: "Community area",
  },
  {
    id: "workshop-css-grid",
    type: "workshop",
    title: "CSS Grid Escape Room",
    durationMinutes: 60,
    description: "Solve layout puzzles with grid, subgrid, and one suspicious fr unit.",
    location: "Studio A",
  },
  {
    id: "workshop-edge-functions",
    type: "workshop",
    title: "Edge Functions in 45 Minutes",
    durationMinutes: 45,
    description: "Deploy a tiny API that runs closer to your users. Node, Deno, or Bun — pick your poison.",
    location: "Lab 2",
  },
  {
    id: "workshop-devtools",
    type: "workshop",
    title: "React DevTools Detective Hour",
    durationMinutes: 30,
    description: "Profile renders and hunt down whoever keeps re-rendering the sidebar.",
    location: "Studio B",
  },
  {
    id: "workshop-rsc",
    type: "workshop",
    title: "Build Your First Server Component",
    durationMinutes: 90,
    description: "Bring your laptop — wire up streaming, data fetching, and a client boundary that makes sense.",
    location: "Workshop room",
  },
];

export function getActivitiesByType(
  type: ScheduleEventType,
  maxDurationMinutes?: number
): PredefinedActivity[] {
  return PREDEFINED_ACTIVITIES.filter(
    (activity) =>
      activity.type === type &&
      (maxDurationMinutes == null ||
        activity.durationMinutes <= maxDurationMinutes)
  ).sort((a, b) => a.title.localeCompare(b.title));
}

export function getActivityTypeLabel(type: ScheduleEventType): string {
  switch (type) {
    case "talk":
      return "Talk";
    case "meeting":
      return "Meeting";
    case "break":
      return "Break";
    case "workshop":
      return "Workshop";
  }
}

export function createEventFromActivity(
  activity: PredefinedActivity,
  start: Date,
  end: Date
): ScheduleEvent {
  const id = crypto.randomUUID();

  switch (activity.type) {
    case "talk":
      return {
        id,
        type: "talk",
        title: activity.title,
        start,
        end,
        talkId: activity.talkId ?? 0,
        trackName: activity.trackName,
      };
    case "meeting":
      return {
        id,
        type: "meeting",
        title: activity.title,
        start,
        end,
        location: activity.location,
      };
    case "break":
      return {
        id,
        type: "break",
        title: activity.title,
        start,
        end,
        location: activity.location,
      };
    case "workshop":
      return {
        id,
        type: "workshop",
        title: activity.title,
        start,
        end,
        description: activity.description,
        location: activity.location,
      };
  }
}
