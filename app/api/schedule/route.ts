import { MOCK_USER_SCHEDULE } from "@/lib/schedule/mock-events";

export async function GET() {
  return Response.json(MOCK_USER_SCHEDULE);
}
