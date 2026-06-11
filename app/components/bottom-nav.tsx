"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BottomNavigation,
  BottomNavigationSelectEvent,
} from "@progress/kendo-react-layout";
import type { SVGIcon } from "@progress/kendo-svg-icons";
import {
  envelopeIcon,
  heartIcon,
  homeIcon,
  userIcon,
} from "@progress/kendo-svg-icons";

interface NavItem {
  text: string;
  svgIcon: SVGIcon;
  route: string;
  matchRoutes?: string[];
}

const items: NavItem[] = [
  {
    text: "Home",
    svgIcon: homeIcon,
    route: "/",
    matchRoutes: ["/", "/event"],
  },
  { text: "Discover", svgIcon: heartIcon, route: "/discover" },
  { text: "Invites", svgIcon: envelopeIcon, route: "/invites" },
  { text: "Profile", svgIcon: userIcon, route: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState(false);

  // Show navigation only once a profile exists in the mock API.
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
  }, [pathname]);

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
      onSelect={(e: BottomNavigationSelectEvent) =>
        router.push(e.itemTarget.route)
      }
    />
  );
}
