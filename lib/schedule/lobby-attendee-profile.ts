import { receivedInvites } from "@/app/invites/invite-data";

export type LobbyAttendeeProfile = {
  company: string;
  interests: string[];
  match: number;
  name: string;
  title: string;
};

const TITLES = [
  "Design Engineer",
  "Platform Engineer",
  "DX Lead",
  "Quality Architect",
  "Frontend Lead",
  "Product Engineer",
];

const COMPANIES = [
  "Runtime Labs",
  "EdgeWorks",
  "QueryCraft",
  "Signal Stack",
  "Northstar Design",
  "Cloud Harbor",
];

const INTEREST_POOL = [
  "React",
  "TypeScript",
  "Next.js",
  "Design Systems",
  "Accessibility",
  "Testing",
  "GraphQL",
  "AI Agents",
  "KendoReact",
  "Supabase",
];

function hashName(name: string) {
  return [...name.trim()].reduce(
    (value, character) => value + character.charCodeAt(0),
    0,
  );
}

function pickInterests(name: string, count = 3) {
  const hash = hashName(name);
  const pool = [...INTEREST_POOL];
  const selected: string[] = [];

  for (let index = 0; index < count && pool.length > 0; index += 1) {
    const pickIndex = (hash + index * 7) % pool.length;
    selected.push(pool.splice(pickIndex, 1)[0]);
  }

  return selected;
}

export function getLobbyAttendeeProfile(name: string): LobbyAttendeeProfile {
  const normalizedName = name.trim();
  const invite = receivedInvites.find(
    (item) => item.name.trim().toLowerCase() === normalizedName.toLowerCase(),
  );

  if (invite) {
    return {
      name: invite.name,
      title: invite.title,
      company: invite.company,
      match: invite.match,
      interests: invite.interests,
    };
  }

  const hash = hashName(normalizedName);

  return {
    name: normalizedName,
    title: TITLES[hash % TITLES.length],
    company: COMPANIES[hash % COMPANIES.length],
    match: 72 + (hash % 23),
    interests: pickInterests(normalizedName),
  };
}
