"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";

export async function checkUser() {
    const clerkUser = await currentUser();

    if (!clerkUser) return null;

    const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUser.id))
        .limit(1);

    if (existing) return existing;

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) return null;

    const name =
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
        null;

    const [newUser] = await db
        .insert(users)
        .values({
            clerkId: clerkUser.id,
            email,
            name,
            imageUrl: clerkUser.imageUrl,
        })
        .returning();

    return newUser;
}
