"use server";

import { revalidatePath } from "next/cache";
import { FREE_WORKSPACE_LIMIT, LimitError } from "../plan-limits";
import { checkUser } from "./check-user";
import { auth } from "@clerk/nextjs/server";
import { scopeWhere } from "../workspace-scope";
import {
    getEntitlements,
    getWorkspaceOwnerId,
    workspaceOwnerSelect,
} from "../billing";
import { prisma } from "../prisma";
import { canAccessWorkspace } from "../workspace-access";
import { WorkspaceStatus } from "@/generated/prisma/enums";
import { randomBytes } from "node:crypto";

function revalidateWorkspaceLists() {
    revalidatePath("/dashboard");
    revalidatePath("/workspaces");
}

export async function createWorkspace(
    name: string,
    description?: string,
): Promise<{ workspace: { id: string } } | { limit: LimitError }> {
    const user = await checkUser();
    if (!user) throw new Error("Not Signed In");

    const trimmedName = name.trim();
    if (!trimmedName) throw new Error("Workspace Name Is Required");

    const { orgId } = await auth();
    const scope = scopeWhere(orgId, user.id);

    const { unlimitedWorkspaces } = await getEntitlements(
        orgId ?? user.clerkId,
    );
    if (
        !unlimitedWorkspaces &&
        (await prisma.workspace.count({ where: scope })) >= FREE_WORKSPACE_LIMIT
    ) {
        return { limit: "workspaces" };
    }

    const top = await prisma.workspace.findFirst({
        where: { status: "PLANNING", ...scope },
        orderBy: { position: "asc" },
        select: { position: true },
    });

    const workspace = await prisma.workspace.create({
        data: {
            name: trimmedName,
            description: description?.trim() || null,
            creatorId: user.id,
            clerkOrgId: orgId ?? null,
            position: top ? top.position - 1 : 0,
            doc: { create: {} },
            canvas: { create: {} },
        },
    });

    revalidateWorkspaceLists();
    return { workspace: { id: workspace.id } };
}

export async function updateWorkspace(
    workspaceId: string,
    name: string,
    description?: string,
) {
    if (!(await canAccessWorkspace(workspaceId)))
        throw new Error("Workspace Not Found");

    const trimmedName = name.trim();
    if (!trimmedName) throw new Error("Workspace Name Is Required");

    const workspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
            name: trimmedName,
            ...(description !== undefined && {
                description: description.trim() || null,
            }),
        },
    });

    revalidateWorkspaceLists();
    revalidatePath(`/workspace/${workspaceId}`);
    return workspace;
}

export async function deleteWorkspace(workspaceId: string) {
    const { userId, orgId, orgRole } = await auth();
    if (!userId || !(await canAccessWorkspace(workspaceId)))
        throw new Error("Workspace Not Found");

    const workspace = await prisma.workspace.findUniqueOrThrow({
        where: { id: workspaceId },
        select: workspaceOwnerSelect,
    });
    const isCreator = workspace.creator.clerkId === userId;
    const isOrgAdmin =
        orgRole === "org:admin" && workspace.clerkOrgId === orgId;
    if (!isCreator && !isOrgAdmin) {
        throw new Error(
            "Only The Creator Or An Org Admin Can Delete This Workspace",
        );
    }

    await prisma.workspace.delete({ where: { id: workspaceId } });
    revalidateWorkspaceLists();
}

export async function moveWorkspace(
    workspaceId: string,
    status: WorkspaceStatus,
    position: number,
) {
    if (
        !Object.values(WorkspaceStatus).includes(status) ||
        !Number.isFinite(position)
    ) {
        throw new Error("Invalid Move");
    }
    if (!(await canAccessWorkspace(workspaceId)))
        throw new Error("Workspace Not Found");

    await prisma.workspace.update({
        where: { id: workspaceId },
        data: { status, position },
    });
}

export async function setWorkspaceSharing(
    workspaceId: string,
    enabled: boolean,
): Promise<{ shareToken: string | null } | { limit: LimitError }> {
    if (!(await canAccessWorkspace(workspaceId)))
        throw new Error("Workspace Not Found");

    if (
        enabled &&
        !(await getEntitlements(await getWorkspaceOwnerId(workspaceId)))
            .publicSharing
    ) {
        return { limit: "sharing" };
    }

    const { shareToken } = await prisma.workspace.update({
        where: { id: workspaceId },
        data: {
            shareToken: enabled ? randomBytes(24).toString("base64url") : null,
        },
        select: { shareToken: true },
    });

    revalidatePath(`/workspace/${workspaceId}`);
    return { shareToken };
}
