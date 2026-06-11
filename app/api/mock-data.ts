import type { InterestType, UserProfile } from "@/app/profile/profile-data";

export type MockInterest = {
  id: number;
  name: string;
  type: InterestType;
};

export const mockInterests: MockInterest[] = [
  { id: 1, name: "React", type: "tech" },
  { id: 2, name: "TypeScript", type: "tech" },
  { id: 3, name: "Design Systems", type: "tech" },
  { id: 4, name: "KendoReact", type: "tech" },
  { id: 5, name: "Next.js", type: "tech" },
  { id: 6, name: "Accessibility", type: "tech" },
  { id: 7, name: "Testing", type: "tech" },
  { id: 8, name: "GraphQL", type: "tech" },
  { id: 9, name: "Node.js", type: "tech" },
  { id: 10, name: "AI Agents", type: "tech" },
  { id: 11, name: "APIs", type: "tech" },
  { id: 12, name: "Postgres", type: "tech" },
  { id: 13, name: "Community Building", type: "non_tech" },
  { id: 14, name: "Mentoring", type: "non_tech" },
  { id: 15, name: "Career Growth", type: "non_tech" },
  { id: 16, name: "Product Strategy", type: "non_tech" },
];

const globalMockState = globalThis as typeof globalThis & {
  __gitnationProfile?: UserProfile | null;
};

if (!("__gitnationProfile" in globalMockState)) {
  globalMockState.__gitnationProfile = null;
}

function getInterestType(name: string): InterestType {
  return mockInterests.find((interest) => interest.name === name)?.type ?? "tech";
}

function normalizeProfile(profile: UserProfile): UserProfile {
  const interests = [...new Set(profile.interests)]
    .map((interest) => interest.trim())
    .filter((interest) =>
      mockInterests.some((mockInterest) => mockInterest.name === interest),
    )
    .slice(0, 8);

  return {
    name: profile.name.trim(),
    company: profile.company.trim(),
    descriptions: profile.descriptions.trim(),
    title: profile.title.trim(),
    interests,
    interestTypes: Object.fromEntries(
      interests.map((interest) => [interest, getInterestType(interest)]),
    ),
  };
}

export function getMockProfile() {
  return globalMockState.__gitnationProfile ?? null;
}

export function saveMockProfile(profile: UserProfile) {
  const normalizedProfile = normalizeProfile(profile);
  globalMockState.__gitnationProfile = normalizedProfile;
  return normalizedProfile;
}
