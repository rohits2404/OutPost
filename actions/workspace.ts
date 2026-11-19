"use server";

import {
    canvases,
    docs,
    users,
    workspaces,
    workspaceStatusEnum,
} from "@/db/schema";
import { FREE_WORKSPACE_LIMIT, LimitError } from "@/lib/plan-limit";
import { revalidatePath } from "next/cache";
import { checkUser } from "./checkUser";
import { auth } from "@clerk/nextjs/server";
import { scopeWhere } from "@/lib/workspace-scope";
import { getEntitlements, getWorkspaceOwnerId } from "@/lib/billing";
import { db } from "@/db";
import { and, count, eq } from "drizzle-orm";
import { canAccessWorkspace } from "@/lib/workspace-access";
import { randomBytes } from "node:crypto";

type WorkspaceStatus = (typeof workspaceStatusEnum.enumValues)[number];

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

    if (!trimmedName) {
        throw new Error("Workspace Name Is Required");
    }

    const { orgId } = await auth();

    const scope = scopeWhere(orgId, user.id);

    const { unlimitedWorkspaces } = await getEntitlements(
        orgId ?? user.clerkId,
    );

    return await db
        .transaction(async (tx) => {
            if (!unlimitedWorkspaces) {
                const [result] = await tx
                    .select({
                        total: count(),
                    })
                    .from(workspaces)
                    .where(scope);

                if ((result?.total ?? 0) >= FREE_WORKSPACE_LIMIT) {
                    return { limit: "workspaces" as const };
                }
            }

            const [top] = await tx
                .select({
                    position: workspaces.position,
                })
                .from(workspaces)
                .where(and(eq(workspaces.status, "PLANNING"), scope))
                .orderBy(workspaces.position)
                .limit(1);

            const [workspace] = await tx
                .insert(workspaces)
                .values({
                    name: trimmedName,
                    description: description?.trim() || null,
                    creatorId: user.id,
                    clerkOrgId: orgId ?? null,
                    position: top ? top.position - 1 : 0,
                })
                .returning({
                    id: workspaces.id,
                });

            if (!workspace) {
                throw new Error("Failed To Create Workspace");
            }

            await tx.insert(docs).values({
                workspaceId: workspace.id,
            });

            await tx.insert(canvases).values({
                workspaceId: workspace.id,
            });

            return {
                workspace: {
                    id: workspace.id,
                },
            };
        })
        .then((result) => {
            if ("workspace" in result) {
                revalidateWorkspaceLists();
            }

            return result;
        });
}

export async function updateWorkspace(
    workspaceId: string,
    name: string,
    description?: string,
) {
    if (!(await canAccessWorkspace(workspaceId))) {
        throw new Error("Workspace Not Found");
    }

    const trimmedName = name.trim();

    if (!trimmedName) {
        throw new Error("Workspace Name Is Required");
    }

    const [workspace] = await db
        .update(workspaces)
        .set({
            name: trimmedName,
            ...(description !== undefined && {
                description: description.trim() || null,
            }),
            updatedAt: new Date(),
        })
        .where(eq(workspaces.id, workspaceId))
        .returning();

    if (!workspace) {
        throw new Error("Workspace Not Found");
    }

    revalidateWorkspaceLists();
    revalidatePath(`/workspace/${workspaceId}`);

    return workspace;
}

export async function deleteWorkspace(workspaceId: string) {
    const { userId, orgId, orgRole } = await auth();

    if (!userId || !(await canAccessWorkspace(workspaceId))) {
        throw new Error("Workspace Not Found");
    }

    const [workspace] = await db
        .select({
            clerkOrgId: workspaces.clerkOrgId,
            creator: {
                clerkId: users.clerkId,
            },
        })
        .from(workspaces)
        .innerJoin(users, eq(workspaces.creatorId, users.id))
        .where(eq(workspaces.id, workspaceId))
        .limit(1);

    if (!workspace) {
        throw new Error("Workspace Not Found");
    }

    const isCreator = workspace.creator.clerkId === userId;

    const isOrgAdmin =
        orgRole === "org:admin" && workspace.clerkOrgId === orgId;

    if (!isCreator && !isOrgAdmin) {
        throw new Error(
            "Only The Creator Or An Org Admin Can Delete This Workspace",
        );
    }

    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));

    revalidateWorkspaceLists();
}

export async function moveWorkspace(
    workspaceId: string,
    status: WorkspaceStatus,
    position: number,
) {
    if (
        !workspaceStatusEnum.enumValues.includes(status) ||
        !Number.isFinite(position)
    ) {
        throw new Error("Invalid Move");
    }

    if (!(await canAccessWorkspace(workspaceId))) {
        throw new Error("Workspace Not Found");
    }

    await db
        .update(workspaces)
        .set({
            status,
            position,
            updatedAt: new Date(),
        })
        .where(eq(workspaces.id, workspaceId));
}

export async function setWorkspaceSharing(
    workspaceId: string,
    enabled: boolean,
): Promise<{ shareToken: string | null } | { limit: LimitError }> {
    if (!(await canAccessWorkspace(workspaceId))) {
        throw new Error("Workspace Not Found");
    }

    if (
        enabled &&
        !(await getEntitlements(await getWorkspaceOwnerId(workspaceId)))
            .publicSharing
    ) {
        return { limit: "sharing" };
    }

    const shareToken = enabled ? randomBytes(24).toString("base64url") : null;

    const [workspace] = await db
        .update(workspaces)
        .set({
            shareToken,
            updatedAt: new Date(),
        })
        .where(eq(workspaces.id, workspaceId))
        .returning({
            shareToken: workspaces.shareToken,
        });

    if (!workspace) {
        throw new Error("Workspace Not Found");
    }

    revalidatePath(`/workspace/${workspaceId}`);

    return {
        shareToken: workspace.shareToken,
    };
}
