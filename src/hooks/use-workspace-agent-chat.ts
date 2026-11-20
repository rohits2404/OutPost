"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import {
    DefaultChatTransport,
    lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import type { Editor } from "tldraw";
import type { BlockNoteEditor } from "@blocknote/core";
import {
    agentToolDefs,
    docToolDefs,
    fail,
    type ToolResult,
} from "@/lib/agent-tools";
import { PROMPT_LIMIT_ERROR, UPGRADE_REASONS } from "@/lib/plan-limit";
import {
    executeCanvasTool,
    summarizeCanvas,
    type ShapeIdMap,
} from "@/lib/agent-canvas";
import { executeDocTool, summarizeDoc } from "@/lib/agent-doc";
import { refreshPromptUsage } from "@/components/PlanButton";
import { useUpgradeDialog } from "@/components/UpgradeDialog";

type Editors = {
    canvasEditor: Editor | null;
    docEditor: BlockNoteEditor | null;
};

function runTool(
    { canvasEditor, docEditor }: Editors,
    idMap: ShapeIdMap,
    toolName: string,
    input: unknown,
): ToolResult {
    try {
        if (toolName in docToolDefs) {
            return docEditor
                ? executeDocTool(docEditor, toolName, input)
                : fail(
                      "The Doc Isn't Open In The Current View. Please Switch To The Both Or Document View To Continue.",
                  );
        }
        return canvasEditor
            ? executeCanvasTool(canvasEditor, idMap, toolName, input)
            : fail(
                  "The Canvas Isn't Open In The Current View. Please Switch To The Both Or Document View To Continue.",
              );
    } catch (err) {
        return fail(err instanceof Error ? err.message : "Tool Failed");
    }
}

export function useWorkspaceAgentChat(workspaceId: string, editors: Editors) {
    const idMap = useRef<ShapeIdMap>(new Map());
    const openUpgrade = useUpgradeDialog();
    const editorsRef = useRef(editors);
    useEffect(() => {
        editorsRef.current = editors;
    });

    const [transport] = useState(
        () =>
            new DefaultChatTransport({
                api: "/api/agent",
                body: () => {
                    const { canvasEditor, docEditor } = editorsRef.current;
                    return {
                        workspaceId,
                        canvasContext: canvasEditor
                            ? summarizeCanvas(canvasEditor)
                            : null,
                        docContext: docEditor ? summarizeDoc(docEditor) : null,
                    };
                },
            }),
    );

    const chat = useChat({
        transport,
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
        onFinish: refreshPromptUsage,
        onError: (error) => {
            if (!error.message.includes(PROMPT_LIMIT_ERROR)) return;
            refreshPromptUsage();
            openUpgrade(UPGRADE_REASONS.prompts);
        },
        onToolCall: ({ toolCall }) => {
            const output = runTool(
                editorsRef.current,
                idMap.current,
                toolCall.toolName,
                toolCall.input,
            );
            chat.addToolOutput({
                tool: toolCall.toolName as keyof typeof agentToolDefs,
                toolCallId: toolCall.toolCallId,
                output,
            });
        },
    });

    return chat;
}

export type WorkspaceAgentChat = ReturnType<typeof useWorkspaceAgentChat>;
