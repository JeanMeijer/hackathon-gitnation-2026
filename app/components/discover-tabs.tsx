"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  TabStrip,
  TabStripSelectEventArguments,
  TabStripTab,
} from "@progress/kendo-react-layout";

const tabs = [
  { title: "Discover people", route: "/discover/people" },
  { title: "Discover events", route: "/discover/events" },
] as const;

export default function DiscoverTabs({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const selected = Math.max(
    0,
    tabs.findIndex((tab) => pathname.startsWith(tab.route)),
  );

  const handleSelect = (event: TabStripSelectEventArguments) => {
    const tab = tabs[event.selected];
    if (tab) {
      router.push(tab.route);
    }
  };

  return (
    <div className="discover-shell flex min-h-0 flex-1 flex-col">
      <header className="discover-header border-b border-black/10 px-4 pt-2">
        <TabStrip
          className="discover-tabstrip"
          selected={selected}
          tabAlignment="stretched"
          animation={false}
          onSelect={handleSelect}
        >
          {tabs.map((tab) => (
            <TabStripTab key={tab.route} title={tab.title}>
              {null}
            </TabStripTab>
          ))}
        </TabStrip>
      </header>
      <div className="discover-content flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
