import { Button } from "@/components/ui/button";
import { WorkspaceDialog } from "@/components/WorkspaceDialog";
import { WorkspaceBoard } from "@/components/workspaces/WorkspaceBoard";
import { checkUser } from "@/lib/actions/check-user";
import { prisma } from "@/lib/prisma";
import { getWorkspaceScope } from "@/lib/workspace-scope";
import { withLastActivity, workspaceCardSelect } from "@/lib/workspace-status";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import React from "react";

const WorkspacesPage = async () => {
    const user = await checkUser();
    if (!user) redirect("/sign-in");

    const { orgName, where } = await getWorkspaceScope(user.id);
    const workspaces = await prisma.workspace.findMany({
        where,
        select: { ...workspaceCardSelect, position: true },
        orderBy: { position: "asc" },
    });

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

            {workspaces.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/10 py-16 text-center text-sm text-muted-foreground">
                    No Workspaces Yet. Start One From The Dashboard Or With New
                    Workspace.
                </p>
            ) : (
                <WorkspaceBoard workspaces={workspaces.map(withLastActivity)} />
            )}
        </div>
    );
};

export default WorkspacesPage;
