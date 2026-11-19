import { max } from "date-fns";
import type { InferSelectModel } from "drizzle-orm";
import { workspaceStatusEnum, workspaces } from "@/db/schema";

export type WorkspaceStatus = (typeof workspaceStatusEnum.enumValues)[number];

export const WORKSPACE_STATUSES: {
    status: WorkspaceStatus;
    title: string;
}[] = [
    { status: "PLANNING", title: "Planning" },
    { status: "IN_PROGRESS", title: "In Progress" },
    { status: "IN_REVIEW", title: "In Review" },
    { status: "DONE", title: "Done" },
];

export function statusTitle(status: WorkspaceStatus) {
    return WORKSPACE_STATUSES.find((s) => s.status === status)?.title ?? status;
}

export type Workspace = InferSelectModel<typeof workspaces>;

export const workspaceCardSelect = {
    id: workspaces.id,
    name: workspaces.name,
    description: workspaces.description,
    status: workspaces.status,
    updatedAt: workspaces.updatedAt,
} as const;

type Dated = { updatedAt: Date } | null;

export function withLastActivity<
    T extends {
        updatedAt: Date;
        doc: Dated;
        canvas: Dated;
    },
>(workspace: T) {
    const lastActivity = max([
        workspace.updatedAt,
        workspace.doc?.updatedAt ?? 0,
        workspace.canvas?.updatedAt ?? 0,
    ]);

    return { ...workspace, lastActivity };
}
