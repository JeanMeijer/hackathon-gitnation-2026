"use client";

import { useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BottomNavigation,
  BottomNavigationSelectEvent,
} from "@progress/kendo-react-layout";
import type { SVGIcon } from "@progress/kendo-svg-icons";
import { calendarIcon, heartIcon, homeIcon, userIcon } from "@progress/kendo-svg-icons";
import { getSavedProfile, subscribeToProfile } from "../profile/profile-data";

interface NavItem {
  text: string;
  svgIcon: SVGIcon;
  route: string;
  matchRoutes?: string[];
}

const items: NavItem[] = [
  { text: "Home", svgIcon: homeIcon, route: "/" },
  { text: "Discover", svgIcon: heartIcon, route: "/recommendations" },
  {
    text: "Schedule",
    svgIcon: calendarIcon,
    route: "/schedule",
    matchRoutes: ["/schedule", "/event"],
  },
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
      selected: item.matchRoutes
        ? item.matchRoutes.some(
            (route) =>
              pathname === route || pathname.startsWith(`${route}/`),
          )
        : item.route === "/"
          ? pathname === item.route
          : pathname.startsWith(item.route),
      }))}
      onSelect={(e) => router.push(e.itemTarget.route)}
    />
  );
}
