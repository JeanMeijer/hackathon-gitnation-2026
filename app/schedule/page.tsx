import type { Metadata } from "next";
import MySchedule from "@/app/components/my-schedule";

export const metadata: Metadata = {
  title: "My Schedule",
};

export default function SchedulePage() {
  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-black/10 px-4 py-3">
        <h1 className="text-lg font-semibold">My Schedule</h1>
      </header>
      <div className="min-h-0 flex-1">
        <MySchedule />
      </div>
    </main>
  );
}
