import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { workspaces, users } from "@/db/schema";

export async function canAccessWorkspace(workspaceId: string) {
    const { userId, orgId } = await auth();

    if (!userId) return false;

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

    if (!workspace) return false;

    if (!workspace.clerkOrgId) {
        return workspace.creator.clerkId === userId;
    }

    if (workspace.clerkOrgId === orgId) {
        return true;
    }

    const clerk = await clerkClient();

    const { data: memberships } =
        await clerk.users.getOrganizationMembershipList({
            userId,
            limit: 100,
        });

    return memberships.some(
        (membership) => membership.organization.id === workspace.clerkOrgId,
    );
}
