"use client";

import { useScheduleQuery } from "@/hooks/use-schedule-query";

export default function Home() {
  const { data, isLoading, error } = useScheduleQuery();

  if (isLoading) return <main className="flex flex-1 flex-col p-4">Loading...</main>;
  if (error) return <main className="flex flex-1 flex-col p-4">Error: {error.message}</main>;

  return (
    <main className="flex flex-1 flex-col p-4">
      <pre className="overflow-auto text-sm">{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
