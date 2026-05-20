import { db }           from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { eq }           from "drizzle-orm";

export async function getUserWithOrg(userId: string) {
  const result = await db
    .select({
      user: users,
      organization: organizations,
    })
    .from(users)
    .leftJoin(organizations, eq(users.organizationId, organizations.id))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] ?? null;
}
