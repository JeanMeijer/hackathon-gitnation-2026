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
    description:
      "Solve layout puzzles with grid, subgrid, and one suspicious fr unit. Bring your laptop and a sense of adventure.",
    attendees: [{ name: "Layout Wizard" }, { name: "Grid Enthusiast" }],
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
  "conf-talk-keynote": {
    description:
      "Opening keynote on where web development is headed — AI, edge, and the next generation of frameworks.",
    attendees: [
      { name: "Jordan Lee" },
      { name: "Priya Patel" },
      { name: "Marco Rossi" },
      { name: "Elena Vogt" },
    ],
  },
  "conf-talk-ts6": {
    description:
      "A walkthrough of upcoming TypeScript features and migration tips for large codebases.",
    attendees: [
      { name: "Elena Vogt" },
      { name: "Chris Nguyen" },
      { name: "Fatima Hassan" },
    ],
  },
  "conf-talk-rsc": {
    description:
      "Explore patterns for composing server and client components, streaming UI, and data fetching in modern React apps.",
    attendees: [
      { name: "Jordan Lee" },
      { name: "Priya Patel" },
      { name: "Marco Rossi" },
    ],
  },
  "conf-talk-panel": {
    description:
      "Industry experts debate the state of state management — signals, stores, and server state in 2026.",
    attendees: [
      { name: "Chris Nguyen" },
      { name: "Fatima Hassan" },
      { name: "Tom Becker" },
    ],
  },
  "conf-talk-supabase": {
    description:
      "Learn how to build collaborative, real-time experiences with Supabase Realtime and Row Level Security.",
    attendees: [
      { name: "Sofia Martinez" },
      { name: "Liam O'Brien" },
      { name: "Yuki Tanaka" },
    ],
  },
  "conf-workshop-rsc": {
    description:
      "Bring your laptop — wire up streaming, data fetching, and a client boundary that actually makes sense.",
    attendees: [{ name: "RSC Host" }, { name: "Streaming Stan" }],
  },
  "conf-workshop-css-grid": {
    description:
      "Solve layout puzzles with grid, subgrid, and one suspicious fr unit. No floats allowed.",
    attendees: [{ name: "Layout Wizard" }, { name: "Grid Enthusiast" }],
  },
  "conf-workshop-edge-functions": {
    description:
      "Deploy a tiny API that runs closer to your users. We'll cover cold starts, routing, and why edge is not just a buzzword.",
    attendees: [{ name: "Edge Evangelist" }],
  },
  "conf-workshop-devtools": {
    description:
      "Profile renders, inspect component trees, and finally find who keeps re-rendering the sidebar.",
    attendees: [{ name: "DevTools Detective" }],
  },
  "conf-talk-keynote-closing": {
    description: "Closing remarks and highlights from GitNation 2026.",
    attendees: [{ name: "Conference staff" }],
  },
};
