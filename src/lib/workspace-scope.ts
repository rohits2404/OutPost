import { auth, clerkClient } from "@clerk/nextjs/server";
import { eq, and, isNull, type SQL } from "drizzle-orm";
import { workspaces } from "@/db/schema";

export function scopeWhere(
    orgId: string | null | undefined,
    userId: string,
): SQL {
    return orgId
        ? eq(workspaces.clerkOrgId, orgId)
        : and(isNull(workspaces.clerkOrgId), eq(workspaces.creatorId, userId))!;
}

export async function getWorkspaceScope(userId: string) {
    const { orgId } = await auth();

    const orgName = orgId
        ? (
              await (
                  await clerkClient()
              ).organizations.getOrganization({
                  organizationId: orgId,
              })
          ).name
        : "Personal";

    return {
        orgName,
        where: scopeWhere(orgId, userId),
    };
}
