export const FREE_WORKSPACE_LIMIT = 3;
export const FREE_MONTHLY_PROMPTS = 20;

export const PROMPT_LIMIT_ERROR = "prompt_limit_reached";

export const UPGRADE_REASONS = {
    prompts: {
        title: "You're Out Of Agent Prompts",
        description:
            "This Workspace's Plan Has Used All Its Prompts For This Month. Upgrade For More.",
    },
    workspaces: {
        title: `You've Reached ${FREE_WORKSPACE_LIMIT} Workspaces`,
        description: `The Free Plan Includes ${FREE_WORKSPACE_LIMIT} Workspaces. Upgrade For Unlimited Workspaces.`,
    },
    sharing: {
        title: "Public Links Are a Paid Feature",
        description:
            "Upgrade To Share a Read-Only Link To This Workspace With Anyone.",
    },
    pdfExport: {
        title: "PDF Export Is a Paid Feature",
        description:
            "Upgrade To Export This Workspace's Doc And Canvas As PDFs.",
    },
};

export type LimitError = keyof typeof UPGRADE_REASONS;
