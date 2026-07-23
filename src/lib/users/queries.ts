import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function listUsers() {
  return db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  });
}

export async function getUserById(id: string) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}
