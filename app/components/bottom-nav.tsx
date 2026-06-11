"use client";

import { usePathname, useRouter } from "next/navigation";
import { BottomNavigation } from "@progress/kendo-react-layout";
import { homeIcon, userIcon } from "@progress/kendo-svg-icons";

const items = [
  { text: "Home", svgIcon: homeIcon, route: "/" },
  { text: "Profile", svgIcon: userIcon, route: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <BottomNavigation
      positionMode="fixed"
      themeColor="primary"
      items={items.map((item) => ({
        ...item,
        selected: pathname === item.route,
      }))}
      onSelect={(e) =>
        router.push(e.itemTarget.route)
      }
    />
  );
}
