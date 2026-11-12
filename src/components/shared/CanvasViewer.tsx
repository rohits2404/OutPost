"use client";

import { Tldraw, type Editor, type TLEditorSnapshot } from "tldraw";
import "tldraw/tldraw.css";
import { EntityTableShapeUtil } from "@/components/EntityTable/EntityTableShapeUtil";

const shapeUtils = [EntityTableShapeUtil];

export function CanvasViewer({
    snapshot,
}: {
    snapshot: TLEditorSnapshot | null;
}) {
    const handleMount = (editor: Editor) => {
        editor.updateInstanceState({ isReadonly: true });
        editor.zoomToFit();
    };

    return (
        <div className="isolate h-full">
            <Tldraw
                snapshot={snapshot ?? undefined}
                shapeUtils={shapeUtils}
                onMount={handleMount}
                colorScheme="dark"
                licenseKey={process.env.NEXT_PUBLIC_TLDRAW_LICENSE_KEY}
            />
        </div>
    );
}
