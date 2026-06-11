"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import SchedulePage from "./schedule-page";
import { getSavedProfile, subscribeToProfile } from "../profile/profile-data";

export default function OnboardingGate() {
  const router = useRouter();
  const profile = useSyncExternalStore(
    subscribeToProfile,
    getSavedProfile,
    () => null,
  );

  useEffect(() => {
    if (!profile) {
      router.replace("/onboarding");
    }
  }, [profile, router]);

  if (!profile) {
    return null;
  }

  return <SchedulePage />;
}
