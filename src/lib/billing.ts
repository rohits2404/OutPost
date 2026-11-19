import { eq, and, gte, count } from "drizzle-orm";
import { db } from "@/db";
import { agentPrompts, users, workspaces } from "@/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { FREE_MONTHLY_PROMPTS } from "./plan-limit";

const PROMPT_FEATURES = [
    { feature: "agent_prompts_2000", perMember: 2000 },
    { feature: "agent_prompts_500", perMember: 500 },
];

export function workspaceOwnerId(workspace: {
    clerkOrgId: string | null;
    creator: { clerkId: string };
}) {
    return workspace.clerkOrgId ?? workspace.creator.clerkId;
}

export async function getWorkspaceOwnerId(workspaceId: string) {
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
        throw new Error(`Workspace Not Found: ${workspaceId}`);
    }

    return workspaceOwnerId(workspace);
}

export async function getEntitlements(ownerId: string) {
    const clerk = await clerkClient();
    const isOrg = ownerId.startsWith("org_");
    const features = new Set<string>();

    try {
        const subscription = isOrg
            ? await clerk.billing.getOrganizationBillingSubscription(ownerId)
            : await clerk.billing.getUserBillingSubscription(ownerId);

        for (const item of subscription.subscriptionItems) {
            if (item.status === "active" || item.status === "past_due") {
                item.plan?.features.forEach((feature) =>
                    features.add(feature.slug),
                );
            }
        }
    } catch {}

    const paid = PROMPT_FEATURES.find(({ feature }) => features.has(feature));

    let promptLimit = FREE_MONTHLY_PROMPTS;

    if (paid) {
        const members = isOrg
            ? ((
                  await clerk.organizations.getOrganization({
                      organizationId: ownerId,
                      includeMembersCount: true,
                  })
              ).membersCount ?? 1)
            : 1;

        promptLimit = paid.perMember * members;
    }

    return {
        isPaid: !!paid,
        promptLimit,
        unlimitedWorkspaces: features.has("unlimited_workspaces"),
        publicSharing: features.has("public_sharing"),
        pdfExport: features.has("pdf_export"),
    };
}

function startOfMonthUtc() {
    const now = new Date();

    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function getPromptUsage(ownerId: string) {
    const [{ promptLimit, isPaid }, usageResult] = await Promise.all([
        getEntitlements(ownerId),

        db
            .select({
                used: count(),
            })
            .from(agentPrompts)
            .where(
                and(
                    eq(agentPrompts.ownerId, ownerId),
                    gte(agentPrompts.createdAt, startOfMonthUtc()),
                ),
            ),
    ]);

    return {
        used: usageResult[0]?.used ?? 0,
        limit: promptLimit,
        isPaid,
    };
}

export async function recordPrompt(
    ownerId: string,
    userId: string,
    workspaceId: string,
) {
    await db.insert(agentPrompts).values({
        ownerId,
        userId,
        workspaceId,
    });
}
