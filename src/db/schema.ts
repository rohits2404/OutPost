import {
    pgTable,
    pgEnum,
    text,
    timestamp,
    doublePrecision,
    jsonb,
    bytea,
    index,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const workspaceStatusEnum = pgEnum("WorkspaceStatus", [
    "PLANNING",
    "IN_PROGRESS",
    "IN_REVIEW",
    "DONE",
]);

export const users = pgTable("User", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),

    clerkId: text("clerkId").notNull().unique(),

    email: text("email").notNull().unique(),

    name: text("name"),

    imageUrl: text("imageUrl"),

    createdAt: timestamp("createdAt", {
        mode: "date",
        precision: 3,
    })
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updatedAt", {
        mode: "date",
        precision: 3,
    })
        .notNull()
        .$onUpdate(() => new Date()),
});

export const workspaces = pgTable(
    "Workspace",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),

        name: text("name").notNull(),

        description: text("description"),

        creatorId: text("creatorId")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        clerkOrgId: text("clerkOrgId"),

        status: workspaceStatusEnum("status").notNull().default("PLANNING"),

        position: doublePrecision("position").notNull().default(0),

        shareToken: text("shareToken").unique(),

        createdAt: timestamp("createdAt", {
            mode: "date",
            precision: 3,
        })
            .notNull()
            .defaultNow(),

        updatedAt: timestamp("updatedAt", {
            mode: "date",
            precision: 3,
        })
            .notNull()
            .$onUpdate(() => new Date()),
    },
    (table) => [
        index("Workspace_creatorId_idx").on(table.creatorId),
        index("Workspace_clerkOrgId_idx").on(table.clerkOrgId),
    ],
);

export const docs = pgTable("Doc", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),

    workspaceId: text("workspaceId")
        .notNull()
        .unique()
        .references(() => workspaces.id, {
            onDelete: "cascade",
        }),

    content: jsonb("content"),

    yjsState: bytea("yjsState"),

    createdAt: timestamp("createdAt", {
        mode: "date",
        precision: 3,
    })
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updatedAt", {
        mode: "date",
        precision: 3,
    })
        .notNull()
        .$onUpdate(() => new Date()),
});

export const canvases = pgTable("Canvas", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => createId()),

    workspaceId: text("workspaceId")
        .notNull()
        .unique()
        .references(() => workspaces.id, {
            onDelete: "cascade",
        }),

    content: jsonb("content"),

    createdAt: timestamp("createdAt", {
        mode: "date",
        precision: 3,
    })
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updatedAt", {
        mode: "date",
        precision: 3,
    })
        .notNull()
        .$onUpdate(() => new Date()),
});

export const agentPrompts = pgTable(
    "AgentPrompt",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => createId()),

        ownerId: text("ownerId").notNull(),

        userId: text("userId")
            .notNull()
            .references(() => users.id, {
                onDelete: "cascade",
            }),

        workspaceId: text("workspaceId").references(() => workspaces.id, {
            onDelete: "set null",
        }),

        createdAt: timestamp("createdAt", {
            mode: "date",
            precision: 3,
        })
            .notNull()
            .defaultNow(),
    },
    (table) => [
        index("AgentPrompt_ownerId_createdAt_idx").on(
            table.ownerId,
            table.createdAt,
        ),
    ],
);
