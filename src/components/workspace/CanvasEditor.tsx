"use client";

import {
    atom,
    computed,
    createTLCurrentUser,
    createUserId,
    defaultBindingUtils,
    defaultShapeUtils,
    DefaultToolbar,
    DefaultToolbarContent,
    Editor,
    getUserPreferences,
    inlineBase64AssetStore,
    TLComponents,
    Tldraw,
    TLEditorSnapshot,
    UserRecordType,
} from "tldraw";
import { EntityTableShapeUtil } from "../EntityTable/EntityTableShapeUtil";
import { useSync, useSyncDemo } from "@tldraw/sync";
import { AddEntityTableButton } from "../EntityTable/AddEntityTableButton";
import { useMemo, useRef } from "react";
import { useWorkspaceEditors } from "../WorkspaceEditorsContext";
import { useUser } from "@clerk/nextjs";
import { colorForUser } from "@/lib/utils";
import { Prisma } from "@/generated/prisma/client";
import { saveCanvasContent } from "@/lib/actions/canvas";
import { snapArrowBindingToRow } from "../EntityTable/snapArrowToRow";
import "tldraw/tldraw.css";

const SAVE_DEBOUNCE_MS = 1000;

const shapeUtils = [EntityTableShapeUtil];

const SYNC_URL = process.env.NEXT_PUBLIC_TLDRAW_SYNC_URL;

const syncShapeUtils = [...defaultShapeUtils, ...shapeUtils];

type SyncOptions = {
    roomId: string;
    users?: Parameters<typeof useSyncDemo>[0]["users"];
};

const useCanvasSync = SYNC_URL
    ? ({ roomId, users }: SyncOptions) =>
          useSync({
              uri: `${SYNC_URL}/connect/${roomId}`,
              assets: inlineBase64AssetStore,
              shapeUtils: syncShapeUtils,
              bindingUtils: defaultBindingUtils,
              users,
          })
    : ({ roomId, users }: SyncOptions) =>
          useSyncDemo({ roomId, shapeUtils, users });

const components: TLComponents = {
    StylePanel: null,
    PageMenu: null,
    MainMenu: null,
    Toolbar: () => (
        <DefaultToolbar orientation="vertical">
            <AddEntityTableButton />
            <DefaultToolbarContent />
        </DefaultToolbar>
    ),
};

export function CanvasEditor({
    workspaceId,
    initialSnapshot,
}: {
    workspaceId: string;
    initialSnapshot: TLEditorSnapshot | null;
}) {
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { setCanvasEditor } = useWorkspaceEditors();
    const { user } = useUser();

    const userId = user?.id;
    const userName = user?.fullName ?? user?.username ?? "Anonymous";
    const userImageUrl = user?.imageUrl ?? "";
    const users = useMemo(() => {
        if (!userId) return undefined;
        return {
            currentUser: atom(
                "currentUser",
                UserRecordType.create({
                    id: createUserId(userId),
                    name: userName,
                    color: colorForUser(userId),
                    imageUrl: userImageUrl,
                }),
            ),
        };
    }, [userId, userName, userImageUrl]);

    const currentUser = useMemo(() => {
        if (!userId) return undefined;
        return createTLCurrentUser({
            userPreferences: computed("clerkUserPreferences", () => ({
                ...getUserPreferences(),
                id: userId,
                name: userName,
                color: colorForUser(userId),
            })),
        });
    }, [userId, userName]);

    const store = useCanvasSync({ roomId: `outpost-${workspaceId}`, users });

    const handleMount = (editor: Editor) => {
        setCanvasEditor(editor);
        if (initialSnapshot && editor.getCurrentPageShapeIds().size === 0) {
            editor.loadSnapshot(initialSnapshot);
        }

        editor.store.listen(
            () => {
                if (saveTimeout.current) clearTimeout(saveTimeout.current);
                saveTimeout.current = setTimeout(() => {
                    const plainSnapshot = JSON.parse(
                        JSON.stringify(editor.getSnapshot()),
                    ) as Prisma.InputJsonValue;
                    saveCanvasContent(workspaceId, plainSnapshot);
                }, SAVE_DEBOUNCE_MS);
            },
            { source: "user", scope: "document" },
        );

        editor.store.listen(
            (entry) => {
                for (const record of Object.values(entry.changes.added)) {
                    if (
                        record.typeName === "binding" &&
                        record.type === "arrow"
                    ) {
                        snapArrowBindingToRow(editor, record);
                    }
                }
            },
            { source: "user", scope: "all" },
        );

        return () => setCanvasEditor(null);
    };

    return (
        <div className="isolate h-full [&_.tlui-main-toolbar--vertical]:top-4!">
            <Tldraw
                store={store}
                user={currentUser}
                onMount={handleMount}
                components={components}
                colorScheme="dark"
                shapeUtils={shapeUtils}
                licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
            />
        </div>
    );
}
