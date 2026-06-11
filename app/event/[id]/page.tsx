import type { Metadata } from "next";
import EventPage from "@/app/components/event-page";

export const metadata: Metadata = {
  title: "Event",
};

interface EventRoutePageProps {
  params: Promise<{ id: string }>;
}

export default async function EventRoutePage({ params }: EventRoutePageProps) {
  const { id } = await params;

  return <EventPage eventId={id} />;
}
