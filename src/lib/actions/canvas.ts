"use server";

import { Prisma } from "@/generated/prisma/client";
import { canAccessWorkspace } from "../workspace-access";
import { prisma } from "../prisma";

export async function saveCanvasContent(
    workspaceId: string,
    content: Prisma.InputJsonValue,
) {
    if (!(await canAccessWorkspace(workspaceId)))
        throw new Error("Workspace Not Found");

    await prisma.canvas.update({
        where: { workspaceId },
        data: { content },
    });
}
