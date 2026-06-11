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
    id: "custom-lunch-mentors",
    type: "custom",
    title: "Lunch with mentors",
    durationMinutes: 60,
    description: "Informal Q&A over food",
    location: "Restaurant district",
  },
  {
    id: "custom-expo",
    type: "custom",
    title: "Expo hall visit",
    durationMinutes: 45,
    location: "Expo hall",
  },
  {
    id: "custom-networking",
    type: "custom",
    title: "Open networking",
    durationMinutes: 30,
    location: "Community area",
  },
  {
    id: "custom-workshop",
    type: "custom",
    title: "Hands-on React workshop",
    durationMinutes: 90,
    description: "Bring your laptop",
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
    case "custom":
      return "Custom";
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
    case "custom":
      return {
        id,
        type: "custom",
        title: activity.title,
        start,
        end,
        description: activity.description,
        location: activity.location,
      };
  }
}
