"use client";

import { Button } from "@progress/kendo-react-buttons";
import { plusIcon } from "@progress/kendo-svg-icons";

interface ScheduleHeaderProps {
  onNewActivity: () => void;
}

export default function ScheduleHeader({ onNewActivity }: ScheduleHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
      <h1 className="text-lg font-semibold">My Schedule</h1>
      <Button
        themeColor="primary"
        fillMode="outline"
        svgIcon={plusIcon}
        onClick={onNewActivity}
      >
        New activity
      </Button>
    </header>
  );
}
