"use server";

import { db } from "@/db";
import { docs } from "@/db/schema";
import { JsonValue } from "@/lib/db/types";
import { canAccessWorkspace } from "@/lib/workspace-access";
import * as Y from "yjs";
import { eq } from "drizzle-orm";

export async function saveDocContent(
    workspaceId: string,
    yjsState: string,
    content: JsonValue,
) {
    if (!(await canAccessWorkspace(workspaceId))) {
        throw new Error("Workspace Not Found");
    }

    const incoming = Buffer.from(yjsState, "base64");

    await db.transaction(async (tx) => {
        const [row] = await tx
            .select({
                yjsState: docs.yjsState,
            })
            .from(docs)
            .where(eq(docs.workspaceId, workspaceId))
            .for("update");

        if (!row) {
            throw new Error("Document Not Found");
        }

        const merged = row.yjsState
            ? Y.mergeUpdates([row.yjsState, incoming])
            : incoming;

        await tx
            .update(docs)
            .set({
                yjsState: Buffer.from(merged),
                content,
                updatedAt: new Date(),
            })
            .where(eq(docs.workspaceId, workspaceId));
    });
}
