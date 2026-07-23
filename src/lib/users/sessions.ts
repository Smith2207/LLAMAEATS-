import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";

export async function getUserSessions(userId: string) {
  return db.query.sessions.findMany({
    where: eq(sessions.userId, userId),
    orderBy: [desc(sessions.expires)],
  });
}
