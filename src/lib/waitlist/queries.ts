import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { waitlistEntries } from "@/db/schema";

export async function getUserWaitlistEntries(userId: string) {
  return db.query.waitlistEntries.findMany({
    where: and(eq(waitlistEntries.userId, userId), inArray(waitlistEntries.status, ["activa", "notificada"])),
    orderBy: [desc(waitlistEntries.createdAt)],
    with: {
      restaurant: { columns: { name: true, slug: true } },
    },
  });
}
