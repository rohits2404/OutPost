"use client";

import { outpostDarkTheme } from "@/lib/blocknote-theme";
import { Block } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";

export function DocViewer({ content }: { content: Block[] | null }) {
    const editor = useCreateBlockNote({
        initialContent: content?.length ? content : undefined,
    });
    return (
        <BlockNoteView
            editor={editor}
            editable={false}
            theme={outpostDarkTheme}
        />
    );
}
