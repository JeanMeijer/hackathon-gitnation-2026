"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SchedulePage from "./schedule-page";

export default function OnboardingGate() {
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  // Gate on whether a profile exists in the DB.
  useEffect(() => {
    let active = true;
    fetch("/api/profile")
      .then((res) => {
        if (active) setHasProfile(res.ok);
      })
      .catch(() => {
        if (active) setHasProfile(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (hasProfile === false) {
      router.replace("/onboarding");
    }
  }, [hasProfile, router]);

  if (!hasProfile) {
    return null;
  }

  return <SchedulePage />;
}
