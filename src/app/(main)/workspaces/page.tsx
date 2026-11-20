import { checkUser } from "../../../../actions/checkUser";
import { redirect } from "next/navigation";
import { getWorkspaceScope } from "@/lib/workspace-scope";
import { db } from "@/db";
import { canvases, docs, users, workspaces } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { withLastActivity } from "@/lib/workspace-status";
import { WorkspaceDialog } from "@/components/WorkspaceDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WorkspaceBoard } from "@/components/workspaces/WorkspaceBoard";
import React from "react";

export default async function WorkspacesPage() {
    const user = await checkUser();

    if (!user) redirect("/sign-in");

    const { orgName, where } = await getWorkspaceScope(user.id);

    const workspaceRows = await db
        .select({
            id: workspaces.id,
            name: workspaces.name,
            description: workspaces.description,
            status: workspaces.status,
            updatedAt: workspaces.updatedAt,
            position: workspaces.position,

            creator: {
                name: users.name,
                imageUrl: users.imageUrl,
            },

            doc: {
                updatedAt: docs.updatedAt,
            },

            canvas: {
                updatedAt: canvases.updatedAt,
            },
        })
        .from(workspaces)
        .innerJoin(users, eq(workspaces.creatorId, users.id))
        .leftJoin(docs, eq(workspaces.id, docs.workspaceId))
        .leftJoin(canvases, eq(workspaces.id, canvases.workspaceId))
        .where(where)
        .orderBy(asc(workspaces.position));

    const workspacesWithActivity = workspaceRows.map(withLastActivity);

    return (
        <div className="p-8">
            <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                    <p className="text-sm text-muted-foreground">{orgName}</p>
                    <h1 className="text-2xl font-semibold">All Workspaces</h1>
                </div>

                <WorkspaceDialog
                    trigger={
                        <Button className="gap-2">
                            <Plus className="size-4" />
                            New Workspace
                        </Button>
                    }
                />
            </div>

            {workspacesWithActivity.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 py-16 text-center text-sm text-muted-foreground">
                    No Workspaces Yet. Start One From The Dashboard Or With New
                    Workspace.
                </p>
            ) : (
                <WorkspaceBoard workspaces={workspacesWithActivity} />
            )}
        </div>
    );
}
