"use client";

import { WorkspaceAgentChat } from "@/hooks/use-workspace-agent-chat";
import { useState } from "react";
import { useUpgradeDialog } from "../UpgradeDialog";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "../ui/resizable";
import Image from "next/image";
import { Send, Square, Wand2 } from "lucide-react";
import { isDynamicToolUIPart, isToolUIPart } from "ai";
import { PROMPT_LIMIT_ERROR, UPGRADE_REASONS } from "@/lib/plan-limits";
import { submitOnEnter } from "@/lib/utils";
import { MicButton } from "../MicButton";
import { Button } from "../ui/button";

export function AgentChatPanel({
    chat,
    isReady,
}: {
    chat: WorkspaceAgentChat;
    isReady: boolean;
}) {
    const [input, setInput] = useState("");
    const { messages, sendMessage, stop, status, error } = chat;
    const openUpgrade = useUpgradeDialog();

    const isBusy = status === "submitted" || status === "streaming";

    const handleSend = () => {
        const trimmed = input.trim();
        if (!trimmed || !isReady || isBusy) return;
        sendMessage({ text: trimmed });
        setInput("");
    };

    return (
        <div className="pointer-events-none fixed inset-x-0 top-14 bottom-0 z-30">
            <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel />
                <ResizableHandle className="pointer-events-auto" />
                <ResizablePanel
                    defaultSize={360}
                    minSize={280}
                    maxSize={640}
                    className="pointer-events-auto flex flex-col border-l border-white/10 bg-card shadow-2xl"
                >
                    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-white/6 px-4 text-sm font-medium">
                        <Image
                            src="/brand/mascot-dark.png"
                            alt=""
                            width={18}
                            height={18}
                            className="size-4.5"
                        />
                        OutPost Agent
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto p-4">
                        {messages.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Ask The Agent To Draw a Diagram, Write Or Edit
                                The Doc, Or Both. Say &ldquo;In The Doc&rdquo;
                                Or &ldquo;On The Canvas&rdquo; To Keep It To One
                                Side.
                            </p>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`max-w-[85%] space-y-1.5 rounded-lg px-3 py-2 text-sm ${
                                        message.role === "user"
                                            ? "ml-auto bg-primary text-primary-foreground"
                                            : "bg-white/5 text-foreground"
                                    }`}
                                >
                                    {message.parts.map((part, i) => {
                                        if (part.type === "reasoning") {
                                            const isStreaming =
                                                part.state === "streaming";
                                            return (
                                                <div key={i}>
                                                    <div className="mb-1 flex items-center gap-1.5">
                                                        <Wand2
                                                            className={`h-3 w-3 shrink-0 text-blue-400/60 ${isStreaming ? "animate-pulse" : ""}`}
                                                        />
                                                        <span className="text-[10px] font-medium uppercase tracking-wider text-blue-400/50">
                                                            {part.text
                                                                ? "Agent Reasoning"
                                                                : "Thinking..."}
                                                        </span>
                                                    </div>
                                                    {part.text && (
                                                        <p className="text-[12px] leading-relaxed text-white/35">
                                                            {part.text}
                                                            {isStreaming && (
                                                                <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse align-middle bg-blue-400/60" />
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        }
                                        if (part.type === "text")
                                            return (
                                                <span key={i}>{part.text}</span>
                                            );
                                        if (
                                            isToolUIPart(part) ||
                                            isDynamicToolUIPart(part)
                                        ) {
                                            const toolName =
                                                isDynamicToolUIPart(part)
                                                    ? part.toolName
                                                    : part.type.replace(
                                                          /^tool-/,
                                                          "",
                                                      );
                                            return (
                                                <div
                                                    key={i}
                                                    className="rounded-md bg-black/20 px-2 py-1 text-xs text-muted-foreground"
                                                >
                                                    {part.state ===
                                                    "output-available"
                                                        ? "✓"
                                                        : "…"}{" "}
                                                    {toolName}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            ))
                        )}
                        {isBusy && (
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <span className="inline-flex gap-0.5">
                                    <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                                    <span className="size-1 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                                    <span className="size-1 animate-bounce rounded-full bg-muted-foreground" />
                                </span>
                                Thinking...
                            </p>
                        )}
                        {error && (
                            <p className="rounded-md border border-white/10 bg-white/3 px-3 py-2 text-xs text-muted-foreground">
                                {error.message.includes(PROMPT_LIMIT_ERROR) ? (
                                    <>
                                        You&apos;re Out Of Agent Prompts This
                                        Month.{" "}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openUpgrade(
                                                    UPGRADE_REASONS.prompts,
                                                )
                                            }
                                            className="font-medium text-primary hover:underline"
                                        >
                                            Upgrade
                                        </button>
                                    </>
                                ) : (
                                    "Something Went Wrong. Try Sending That Again."
                                )}
                            </p>
                        )}
                    </div>

                    <div className="flex shrink-0 items-end gap-2 border-t border-white/6 p-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={submitOnEnter(handleSend)}
                            placeholder="Ask The Agent..."
                            rows={1}
                            disabled={!isReady}
                            className="max-h-32 flex-1 resize-none rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-ring disabled:opacity-50"
                        />
                        <MicButton
                            value={input}
                            onChange={setInput}
                            disabled={!isReady}
                        />
                        {isBusy ? (
                            <Button
                                size="icon"
                                variant="secondary"
                                onClick={stop}
                            >
                                <Square className="size-3.5" />
                            </Button>
                        ) : (
                            <Button
                                size="icon"
                                onClick={handleSend}
                                disabled={!input.trim() || !isReady}
                            >
                                <Send className="size-4" />
                            </Button>
                        )}
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
