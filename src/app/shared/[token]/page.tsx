import { db } from "@/db";
import { eq } from "drizzle-orm";
import { canvases, docs, users, workspaces } from "@/db/schema";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEntitlements, workspaceOwnerId } from "@/lib/billing";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { DocViewer } from "@/components/DocEditorLoader";
import { Block } from "@blocknote/core";
import { CanvasViewer } from "@/components/CanvasViewer";
import { TLEditorSnapshot } from "tldraw";
import React from "react";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default async function SharedPage({
    params,
}: PageProps<"/shared/[token]">) {
    const { token } = await params;

    const [workspace] = await db
        .select({
            name: workspaces.name,
            clerkOrgId: workspaces.clerkOrgId,
            creator: {
                clerkId: users.clerkId,
            },
            doc: {
                content: docs.content,
            },
            canvas: {
                content: canvases.content,
            },
        })
        .from(workspaces)
        .innerJoin(users, eq(workspaces.creatorId, users.id))
        .leftJoin(docs, eq(workspaces.id, docs.workspaceId))
        .leftJoin(canvases, eq(workspaces.id, canvases.workspaceId))
        .where(eq(workspaces.shareToken, token))
        .limit(1);

    if (!workspace) notFound();

    if (!(await getEntitlements(workspaceOwnerId(workspace))).publicSharing) {
        notFound();
    }

    return (
        <div className="flex h-dvh flex-col overflow-hidden">
            <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/6 bg-background px-4">
                <Link
                    href="/"
                    className="flex size-8 items-center justify-center rounded-md transition-opacity hover:opacity-80"
                >
                    <Image
                        src="/brand/mascot-dark.png"
                        alt="Outpost"
                        width={24}
                        height={24}
                        className="size-6"
                    />
                </Link>

                <span className="text-sm font-medium">{workspace.name}</span>

                <Badge
                    variant="outline"
                    className="border-white/15 text-xs font-normal text-muted-foreground"
                >
                    View Only
                </Badge>
            </header>

            <ResizablePanelGroup orientation="horizontal" className="flex-1">
                <ResizablePanel defaultSize={40} minSize={20}>
                    <div className="h-full overflow-y-auto pt-6">
                        <DocViewer
                            content={workspace.doc?.content as Block[] | null}
                        />
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={60} minSize={20}>
                    <CanvasViewer
                        snapshot={
                            workspace.canvas?.content as TLEditorSnapshot | null
                        }
                    />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
