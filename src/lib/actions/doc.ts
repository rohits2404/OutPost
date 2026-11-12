"use server";

import { Prisma } from "@/generated/prisma/client";
import { canAccessWorkspace } from "../workspace-access";
import { prisma } from "../prisma";
import * as Y from "yjs";

export async function saveDocContent(
    workspaceId: string,
    yjsState: string,
    content: Prisma.InputJsonValue,
) {
    if (!(await canAccessWorkspace(workspaceId)))
        throw new Error("Workspace Not Found");

    const incoming = Buffer.from(yjsState, "base64");

    await prisma.$transaction(async (tx) => {
        const [row] = await tx.$queryRaw<{ yjsState: Uint8Array | null }[]>`
      SELECT "yjsState" FROM "Doc" WHERE "workspaceId" = ${workspaceId} FOR UPDATE`;
        const merged = row?.yjsState
            ? Y.mergeUpdates([row.yjsState, incoming])
            : incoming;

        await tx.doc.update({
            where: { workspaceId },
            data: { yjsState: Uint8Array.from(merged), content },
        });
    });
}
