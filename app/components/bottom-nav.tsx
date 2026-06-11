"use client";

import { useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BottomNavigation,
  BottomNavigationSelectEvent,
} from "@progress/kendo-react-layout";
import { heartIcon, homeIcon, userIcon } from "@progress/kendo-svg-icons";
import { getSavedProfile, subscribeToProfile } from "../profile/profile-data";

const items = [
  { text: "Home", svgIcon: homeIcon, route: "/" },
  { text: "Discover", svgIcon: heartIcon, route: "/recommendations" },
  { text: "Profile", svgIcon: userIcon, route: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const hasProfile = useSyncExternalStore(
    subscribeToProfile,
    () => Boolean(getSavedProfile()),
    () => false,
  );

  if (pathname === "/onboarding" || !hasProfile) {
    return null;
  }

  return (
    <BottomNavigation
      positionMode="fixed"
      themeColor="primary"
      items={items.map((item) => ({
        ...item,
        selected:
          item.route === "/"
            ? pathname === item.route
            : pathname.startsWith(item.route),
      }))}
      onSelect={(e) =>
        router.push(e.itemTarget.route)
      }
    />
  );
}
