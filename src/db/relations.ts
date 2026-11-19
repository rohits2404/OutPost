import { defineRelations } from "drizzle-orm";
import { users, workspaces, docs, canvases, agentPrompts } from "./schema";

export const relations = defineRelations(
    {
        users,
        workspaces,
        docs,
        canvases,
        agentPrompts,
    },
    (r) => ({
        users: {
            createdWorkspaces: r.many.workspaces({
                from: r.users.id,
                to: r.workspaces.creatorId,
            }),

            agentPrompts: r.many.agentPrompts({
                from: r.users.id,
                to: r.agentPrompts.userId,
            }),
        },

        workspaces: {
            creator: r.one.users({
                from: r.workspaces.creatorId,
                to: r.users.id,
            }),

            doc: r.one.docs({
                from: r.workspaces.id,
                to: r.docs.workspaceId,
            }),

            canvas: r.one.canvases({
                from: r.workspaces.id,
                to: r.canvases.workspaceId,
            }),

            agentPrompts: r.many.agentPrompts({
                from: r.workspaces.id,
                to: r.agentPrompts.workspaceId,
            }),
        },

        docs: {
            workspace: r.one.workspaces({
                from: r.docs.workspaceId,
                to: r.workspaces.id,
            }),
        },

        canvases: {
            workspace: r.one.workspaces({
                from: r.canvases.workspaceId,
                to: r.workspaces.id,
            }),
        },

        agentPrompts: {
            user: r.one.users({
                from: r.agentPrompts.userId,
                to: r.users.id,
            }),

            workspace: r.one.workspaces({
                from: r.agentPrompts.workspaceId,
                to: r.workspaces.id,
            }),
        },
    }),
);
