export type EventLobbyAttendee = {
  name: string;
};

export type MockEventDetails = {
  description: string;
  attendees: EventLobbyAttendee[];
};

/** Extra copy and lobby attendees keyed by seed event id. */
export const MOCK_EVENT_DETAILS: Record<string, MockEventDetails> = {
  "1": {
    description:
      "Explore patterns for composing server and client components, streaming UI, and data fetching in modern React apps.",
    attendees: [
      { name: "Jordan Lee" },
      { name: "Priya Patel" },
      { name: "Marco Rossi" },
    ],
  },
  "2": {
    description: "Grab a coffee and connect with other attendees in the lobby.",
    attendees: [],
  },
  "3": {
    description: "Weekly sync to align on design direction and open questions.",
    attendees: [{ name: "Alex" }, { name: "Sam" }],
  },
  "4": {
    description:
      "A walkthrough of upcoming TypeScript features and migration tips for large codebases.",
    attendees: [
      { name: "Elena Vogt" },
      { name: "Chris Nguyen" },
      { name: "Fatima Hassan" },
      { name: "Tom Becker" },
    ],
  },
  "5": {
    description: "Informal Q&A over food with conference mentors.",
    attendees: [{ name: "Mentor Ana" }, { name: "Mentor David" }],
  },
  "6": {
    description:
      "Learn how to build collaborative, real-time experiences with Supabase Realtime and Row Level Security.",
    attendees: [
      { name: "Sofia Martinez" },
      { name: "Liam O'Brien" },
      { name: "Yuki Tanaka" },
    ],
  },
  "7": {
    description: "Stretch your legs and browse the expo hall between sessions.",
    attendees: [],
  },
  "8": {
    description: "Quick standup to share progress and blockers before demo day.",
    attendees: [{ name: "Jonas" }, { name: "Team" }],
  },
};
