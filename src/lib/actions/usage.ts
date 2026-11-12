"use server";

import { auth } from "@clerk/nextjs/server";
import { getPromptUsage } from "../billing";

export async function getActivePromptUsage() {
    const { userId, orgId } = await auth();
    if (!userId) return null;
    return getPromptUsage(orgId ?? userId);
}
