import { NextResponse } from "next/server";
import { expireStaleReservations, markNoShowReservations } from "@/lib/reservations/expire";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [expiredCount, noShowCount] = await Promise.all([
    expireStaleReservations(),
    markNoShowReservations(),
  ]);

  return NextResponse.json({ expired: expiredCount, noShows: noShowCount });
}
