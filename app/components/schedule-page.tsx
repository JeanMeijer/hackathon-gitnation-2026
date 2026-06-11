import MySchedule from "@/app/components/my-schedule";

export default function SchedulePage() {
  return (
    <main
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{ height: "calc(100dvh - 4rem)" }}
    >
      <MySchedule />
    </main>
  );
}
