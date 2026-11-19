CREATE TYPE "WorkspaceStatus" AS ENUM('PLANNING', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');--> statement-breakpoint
CREATE TABLE "AgentPrompt" (
	"id" text PRIMARY KEY,
	"ownerId" text NOT NULL,
	"userId" text NOT NULL,
	"workspaceId" text,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Canvas" (
	"id" text PRIMARY KEY,
	"workspaceId" text NOT NULL UNIQUE,
	"content" jsonb,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Doc" (
	"id" text PRIMARY KEY,
	"workspaceId" text NOT NULL UNIQUE,
	"content" jsonb,
	"yjsState" bytea,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" text PRIMARY KEY,
	"clerkId" text NOT NULL UNIQUE,
	"email" text NOT NULL UNIQUE,
	"name" text,
	"imageUrl" text,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Workspace" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"description" text,
	"creatorId" text NOT NULL,
	"clerkOrgId" text,
	"status" "WorkspaceStatus" DEFAULT 'PLANNING'::"WorkspaceStatus" NOT NULL,
	"position" double precision DEFAULT 0 NOT NULL,
	"shareToken" text UNIQUE,
	"createdAt" timestamp(3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp(3) NOT NULL
);
--> statement-breakpoint
CREATE INDEX "AgentPrompt_ownerId_createdAt_idx" ON "AgentPrompt" ("ownerId","createdAt");--> statement-breakpoint
CREATE INDEX "Workspace_creatorId_idx" ON "Workspace" ("creatorId");--> statement-breakpoint
CREATE INDEX "Workspace_clerkOrgId_idx" ON "Workspace" ("clerkOrgId");--> statement-breakpoint
ALTER TABLE "AgentPrompt" ADD CONSTRAINT "AgentPrompt_userId_User_id_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "AgentPrompt" ADD CONSTRAINT "AgentPrompt_workspaceId_Workspace_id_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "Canvas" ADD CONSTRAINT "Canvas_workspaceId_Workspace_id_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "Doc" ADD CONSTRAINT "Doc_workspaceId_Workspace_id_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_creatorId_User_id_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE;