"use server";

import { db } from "@/db";
import { canvases } from "@/db/schema";
import { JsonValue } from "@/lib/db/types";
import { canAccessWorkspace } from "@/lib/workspace-access";
import { eq } from "drizzle-orm";

export async function saveCanvasContent(
    workspaceId: string,
    content: JsonValue,
) {
    if (!(await canAccessWorkspace(workspaceId))) {
        throw new Error("Workspace Not Found");
    }

    const [canvas] = await db
        .update(canvases)
        .set({
            content,
            updatedAt: new Date(),
        })
        .where(eq(canvases.workspaceId, workspaceId))
        .returning({
            id: canvases.id,
        });

    if (!canvas) {
        throw new Error("Canvas Not Found");
    }
}
