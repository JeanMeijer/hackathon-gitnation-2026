export type InviteStatus = "pending" | "accepted" | "declined";

export type SentInvite = {
  id: string;
  interests: string[];
  match: number;
  name: string;
  sentAt: string;
  status: InviteStatus;
};

export type ReceivedInvite = {
  id: string;
  company: string;
  interests: string[];
  match: number;
  name: string;
  receivedAt: string;
  status: InviteStatus;
  title: string;
};

export const sentInvitesStorageKey = "gitnation-sent-invites";
export const sentInvitesEventName = "gitnation-sent-invites-updated";

export const receivedInvites: ReceivedInvite[] = [
  {
    id: "riley",
    company: "Runtime Labs",
    interests: ["React", "Accessibility", "Testing"],
    match: 94,
    name: "Riley Chen",
    receivedAt: "2026-06-11T09:30:00.000+02:00",
    status: "pending",
    title: "Design Engineer",
  },
  {
    id: "marco",
    company: "EdgeWorks",
    interests: ["Next.js", "APIs", "AI Agents"],
    match: 87,
    name: "Marco Silva",
    receivedAt: "2026-06-11T10:45:00.000+02:00",
    status: "accepted",
    title: "Platform Engineer",
  },
  {
    id: "nora",
    company: "QueryCraft",
    interests: ["GraphQL", "Developer Tools", "TypeScript"],
    match: 82,
    name: "Nora Voss",
    receivedAt: "2026-06-11T12:10:00.000+02:00",
    status: "pending",
    title: "DX Lead",
  },
  {
    id: "eli",
    company: "Signal Stack",
    interests: ["Testing", "Accessibility", "Design Systems"],
    match: 79,
    name: "Eli Warren",
    receivedAt: "2026-06-12T08:40:00.000+02:00",
    status: "pending",
    title: "Quality Architect",
  },
];

const emptySentInvites: SentInvite[] = [];

let cachedRawSentInvites: string | null | undefined;
let cachedSentInvites: SentInvite[] | undefined;

export function getSentInvites() {
  if (typeof window === "undefined") {
    return emptySentInvites;
  }

  const rawInvites = window.localStorage.getItem(sentInvitesStorageKey);

  if (rawInvites === cachedRawSentInvites) {
    return cachedSentInvites ?? emptySentInvites;
  }

  cachedRawSentInvites = rawInvites;

  if (!rawInvites) {
    cachedSentInvites = emptySentInvites;
    return cachedSentInvites;
  }

  try {
    cachedSentInvites = JSON.parse(rawInvites) as SentInvite[];
  } catch {
    cachedSentInvites = emptySentInvites;
  }

  return cachedSentInvites;
}

export function saveSentInvite(invite: Omit<SentInvite, "sentAt" | "status">) {
  const currentInvites = getSentInvites();
  const nextInvite: SentInvite = {
    ...invite,
    sentAt: new Date().toISOString(),
    status: "pending",
  };
  const nextInvites = [
    nextInvite,
    ...currentInvites.filter((currentInvite) => currentInvite.id !== invite.id),
  ];
  const serializedInvites = JSON.stringify(nextInvites);

  window.localStorage.setItem(sentInvitesStorageKey, serializedInvites);
  cachedRawSentInvites = serializedInvites;
  cachedSentInvites = nextInvites;
  window.dispatchEvent(new Event(sentInvitesEventName));
}

export function subscribeToSentInvites(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === sentInvitesStorageKey) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(sentInvitesEventName, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(sentInvitesEventName, callback);
  };
}
