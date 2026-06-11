export type UserProfile = {
  name: string;
  company: string;
  descriptions: string;
  title: string;
  interests: string[];
};

export const profileStorageKey = "gitnation-user-profile";
export const profileStorageEventName = "gitnation-user-profile-updated";

export const defaultUserProfile: UserProfile = {
  name: "Mira",
  company: "TechCorp",
  descriptions:
    "Frontend developer with a passion for React and design systems.",
  title: "Frontend Developer",
  interests: ["React", "TypeScript", "Design Systems", "KendoReact"],
};

export const emptyUserProfile: UserProfile = {
  name: "",
  company: "",
  descriptions: "",
  title: "",
  interests: [],
};

export const availableInterests = [
  "React",
  "TypeScript",
  "Design Systems",
  "KendoReact",
  "Next.js",
  "Accessibility",
  "Testing",
  "GraphQL",
  "Node.js",
  "AI Agents",
  "APIs",
  "Postgres",
];

let cachedRawProfile: string | null | undefined;
let cachedSavedProfile: UserProfile | null | undefined;

export function getSavedProfile() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawProfile = window.localStorage.getItem(profileStorageKey);

  if (rawProfile === cachedRawProfile) {
    return cachedSavedProfile ?? null;
  }

  cachedRawProfile = rawProfile;

  if (!rawProfile) {
    cachedSavedProfile = null;
    return null;
  }

  try {
    cachedSavedProfile = {
      ...defaultUserProfile,
      ...JSON.parse(rawProfile),
    } as UserProfile;
  } catch {
    cachedSavedProfile = null;
  }

  return cachedSavedProfile;
}

export function getProfileSnapshot(fallbackProfile: UserProfile) {
  return getSavedProfile() ?? fallbackProfile;
}

export function saveProfile(profile: UserProfile) {
  const serializedProfile = JSON.stringify(profile);

  window.localStorage.setItem(profileStorageKey, serializedProfile);
  cachedRawProfile = serializedProfile;
  cachedSavedProfile = profile;
  window.dispatchEvent(new Event(profileStorageEventName));
}

export function subscribeToProfile(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === profileStorageKey) {
      callback();
    }
  }

  window.addEventListener("storage", handleStorage);
  window.addEventListener(profileStorageEventName, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(profileStorageEventName, callback);
  };
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
