import { redirect } from "next/navigation";

type ScheduleRedirectProps = {
  searchParams: Promise<{ date?: string }>;
};

export default async function ScheduleRedirect({
  searchParams,
}: ScheduleRedirectProps) {
  const params = await searchParams;

  if (params.date) {
    redirect(`/?date=${encodeURIComponent(params.date)}`);
  }

  redirect("/");
}
