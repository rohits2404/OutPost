import { redirect } from "next/navigation";
import { checkUser } from "../../../../actions/checkUser";
import { getWorkspaceScope } from "@/lib/workspace-scope";
import { db } from "@/db";
import { canvases, docs, users, workspaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { withLastActivity } from "@/lib/workspace-status";
import { compareDesc } from "date-fns";
import { DashboardPrompt } from "@/components/dashboard/DashboardPrompt";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { KanbanSquare, Plus } from "lucide-react";
import { WorkspaceDialog } from "@/components/WorkspaceDialog";
import { RecentWorkspaces } from "@/components/dashboard/RecentWorkspaces";

const RECENT_COUNT = 4;

export default async function DashboardPage() {
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
        .where(where);

    const recent = workspaceRows
        .map(withLastActivity)
        .sort((a, b) => compareDesc(a.lastActivity, b.lastActivity))
        .slice(0, RECENT_COUNT);

    return (
        <div className="p-8">
            <DashboardPrompt />

            <section className="mx-auto max-w-6xl">
                <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            {orgName}
                        </p>
                        <h2 className="text-lg font-semibold">
                            Recent Workspaces
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        {workspaceRows.length > 0 && (
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="gap-1.5 text-muted-foreground"
                            >
                                <Link href="/workspaces">
                                    <KanbanSquare className="size-4" />
                                    View Board ({workspaceRows.length})
                                </Link>
                            </Button>
                        )}

                        <WorkspaceDialog
                            trigger={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5"
                                >
                                    <Plus className="size-4" />
                                    New Workspace
                                </Button>
                            }
                        />
                    </div>
                </div>

                {workspaceRows.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-white/10 py-10 text-center text-sm text-muted-foreground">
                        No Workspaces Yet. Describe What You Want To Plan Above
                        To Start One.
                    </p>
                ) : (
                    <RecentWorkspaces workspaces={recent} />
                )}
            </section>
        </div>
    );
}
