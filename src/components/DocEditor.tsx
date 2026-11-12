"use client";

import { useCollaborativeDoc } from "@/hooks/use-collaborative-doc";
import { SupabaseYjsProvider } from "@/lib/supabase-yjs-provider";
import { colorForUser } from "@/lib/utils";
import { Block } from "@blocknote/core";
import { useUser } from "@clerk/nextjs";
import { useCreateBlockNote } from "@blocknote/react";
import { CollaborationExtension } from "@blocknote/core/yjs";
import { useWorkspaceEditors } from "./WorkspaceEditorsContext";
import { useEffect } from "react";
import { saveDocContent } from "@/lib/actions/doc";
import { toBase64 } from "@/lib/base64";
import { Prisma } from "@/generated/prisma/client";
import * as Y from "yjs";
import { BlockNoteView } from "@blocknote/mantine";
import { outpostDarkTheme } from "@/lib/blocknote-theme";
import "@blocknote/mantine/style.css";

const SAVE_DEBOUNCE_MS = 1000;

type DocEditorProps = {
    workspaceId: string;
    initialContent: Block[] | null;
    initialState: string | null;
};

export function DocEditor({
    workspaceId,
    initialContent,
    initialState,
}: DocEditorProps) {
    const { user } = useUser();
    const collab = useCollaborativeDoc(workspaceId, initialState);

    if (!collab || !user) {
        return (
            <div className="p-6 text-sm text-muted-foreground">
                Loading Document...
            </div>
        );
    }

    return (
        <CollaborativeEditor
            workspaceId={workspaceId}
            initialContent={initialContent}
            doc={collab.doc}
            provider={collab.provider}
            user={{
                name: user.fullName ?? user.username ?? "Anonymous",
                color: colorForUser(user.id),
            }}
        />
    );
}

function CollaborativeEditor({
    workspaceId,
    initialContent,
    doc,
    provider,
    user,
}: Omit<DocEditorProps, "initialState"> & {
    doc: Y.Doc;
    provider: SupabaseYjsProvider;
    user: { name: string; color: string };
}) {
    const fragment = doc.getXmlFragment("document-store");
    const editor = useCreateBlockNote({
        extensions: [CollaborationExtension({ fragment, user, provider })],
    });

    const { setDocEditor } = useWorkspaceEditors();
    useEffect(() => {
        setDocEditor(editor);
        return () => setDocEditor(null);
    }, [editor, setDocEditor]);

    useEffect(() => {
        if (fragment.length === 0 && initialContent?.length) {
            editor.replaceBlocks(editor.document, initialContent);
        }
    }, [editor, fragment, initialContent]);

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        const save = () => {
            timeout = undefined;
            const content = JSON.parse(
                JSON.stringify(editor.document),
            ) as Prisma.InputJsonValue;
            saveDocContent(
                workspaceId,
                toBase64(Y.encodeStateAsUpdate(doc)),
                content,
            );
        };
        const handleUpdate = (_update: Uint8Array, origin: unknown) => {
            if (origin === provider) return;
            clearTimeout(timeout);
            timeout = setTimeout(save, SAVE_DEBOUNCE_MS);
        };

        doc.on("update", handleUpdate);
        return () => {
            doc.off("update", handleUpdate);
            if (timeout) {
                clearTimeout(timeout);
                save();
            }
        };
    }, [doc, editor, provider, workspaceId]);

    return (
        <div className="h-full overflow-y-auto pt-6">
            <BlockNoteView editor={editor} theme={outpostDarkTheme} />
        </div>
    );
}
