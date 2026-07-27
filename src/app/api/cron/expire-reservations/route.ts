import { NextResponse } from "next/server";
import {
  expireStaleReservations,
  expireStaleWaitlistEntries,
  markNoShowReservations,
} from "@/lib/reservations/expire";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [expiredCount, noShowCount, waitlistExpiredCount] = await Promise.all([
    expireStaleReservations(),
    markNoShowReservations(),
    expireStaleWaitlistEntries(),
  ]);

  return NextResponse.json({ expired: expiredCount, noShows: noShowCount, waitlistExpired: waitlistExpiredCount });
}
