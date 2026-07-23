import { NextResponse } from "next/server";
import {
  expireObservedApplications,
  graduateTrials,
  pauseInactiveRestaurants,
  recheckRucStatus,
} from "@/lib/restaurants/monitoring";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [expired, graduated, rucCheck, pausedForInactivity] = await Promise.all([
    expireObservedApplications(),
    graduateTrials(),
    recheckRucStatus(),
    pauseInactiveRestaurants(),
  ]);

  return NextResponse.json({ expired, graduated, rucCheck, pausedForInactivity });
}
