import { db } from "@/db";
import { eq } from "drizzle-orm";
import { canvases, docs, users, workspaces } from "@/db/schema";
import { canAccessWorkspace } from "@/lib/workspace-access";
import { notFound } from "next/navigation";
import { getEntitlements, workspaceOwnerId } from "@/lib/billing";
import { WorkspaceEditorsProvider } from "@/components/WorkspaceEditorsContext";
import Link from "next/link";
import Image from "next/image";
import { EditableWorkspaceName } from "@/components/workspace/EditableWorkspaceName";
import { Button } from "@/components/ui/button";
import { PlanButton } from "@/components/PlanButton";
import { ShareDialog } from "@/components/workspace/ShareDialog";
import { AgentToggleButton } from "@/components/workspace/AgentToggleButton";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { DocEditor } from "@/components/DocEditor";
import { Block } from "@blocknote/core";
import { CanvasEditor } from "@/components/workspace/CanvasEditor";
import { TLEditorSnapshot } from "tldraw";
import React from "react";

type ViewMode = "doc" | "canvas" | "both";

function parseViewMode(value: string | string[] | undefined): ViewMode {
    return value === "doc" || value === "canvas" ? value : "both";
}

export default async function WorkspacePage({
    params,
    searchParams,
}: PageProps<"/workspace/[id]">) {
    const { id } = await params;
    const { view: viewParam, prompt } = await searchParams;

    const view = parseViewMode(viewParam);

    if (!(await canAccessWorkspace(id))) {
        notFound();
    }

    const [workspace] = await db
        .select({
            name: workspaces.name,
            shareToken: workspaces.shareToken,

            clerkOrgId: workspaces.clerkOrgId,

            creator: {
                clerkId: users.clerkId,
            },

            doc: {
                content: docs.content,
                yjsState: docs.yjsState,
            },

            canvas: {
                content: canvases.content,
            },
        })
        .from(workspaces)
        .innerJoin(users, eq(workspaces.creatorId, users.id))
        .leftJoin(docs, eq(workspaces.id, docs.workspaceId))
        .leftJoin(canvases, eq(workspaces.id, canvases.workspaceId))
        .where(eq(workspaces.id, id))
        .limit(1);

    if (!workspace) {
        notFound();
    }

    const entitlements = await getEntitlements(workspaceOwnerId(workspace));

    const showDoc = view === "doc" || view === "both";
    const showCanvas = view === "canvas" || view === "both";

    return (
        <WorkspaceEditorsProvider>
            <div className="flex h-dvh flex-col overflow-hidden">
                <header className="flex h-14 shrink-0 items-center border-b border-white/6 bg-background px-4">
                    <div className="flex flex-1 items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="flex size-8 items-center justify-center rounded-md transition-opacity hover:opacity-80"
                        >
                            <Image
                                src="/brand/mascot-dark.png"
                                alt="Back to dashboard"
                                width={24}
                                height={24}
                                className="size-6"
                            />
                        </Link>

                        <EditableWorkspaceName
                            workspaceId={id}
                            initialName={workspace.name}
                        />
                    </div>

                    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/3 p-1">
                        {(["doc", "both", "canvas"] as const).map((mode) => (
                            <Button
                                key={mode}
                                asChild
                                variant={view === mode ? "secondary" : "ghost"}
                                size="sm"
                                className="capitalize"
                            >
                                <Link
                                    href={
                                        mode === "both"
                                            ? `/workspace/${id}`
                                            : `/workspace/${id}?view=${mode}`
                                    }
                                >
                                    {mode === "doc" ? "Document" : mode}
                                </Link>
                            </Button>
                        ))}
                    </div>

                    <div className="flex flex-1 items-center justify-end gap-2">
                        <PlanButton upgradeOnlyWhenOut />

                        <ShareDialog
                            workspaceId={id}
                            workspaceName={workspace.name}
                            initialShareToken={workspace.shareToken}
                            canShare={entitlements.publicSharing}
                            canExportPdf={entitlements.pdfExport}
                        />

                        <AgentToggleButton
                            workspaceId={id}
                            initialPrompt={
                                typeof prompt === "string" ? prompt : undefined
                            }
                        />
                    </div>
                </header>

                <ResizablePanelGroup
                    key={view}
                    orientation="horizontal"
                    className="flex-1"
                >
                    {showDoc && (
                        <ResizablePanel defaultSize={35} minSize={20}>
                            <DocEditor
                                key={id}
                                workspaceId={id}
                                initialContent={
                                    (workspace.doc?.content as
                                        Block[] | null) ?? null
                                }
                                initialState={
                                    workspace.doc?.yjsState
                                        ? Buffer.from(
                                              workspace.doc.yjsState,
                                          ).toString("base64")
                                        : null
                                }
                            />
                        </ResizablePanel>
                    )}

                    {showDoc && showCanvas && <ResizableHandle withHandle />}

                    {showCanvas && (
                        <ResizablePanel defaultSize={75} minSize={20}>
                            <CanvasEditor
                                workspaceId={id}
                                initialSnapshot={
                                    (workspace.canvas
                                        ?.content as TLEditorSnapshot | null) ??
                                    null
                                }
                            />
                        </ResizablePanel>
                    )}
                </ResizablePanelGroup>
            </div>
        </WorkspaceEditorsProvider>
    );
}
