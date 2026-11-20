import { z } from "zod";

const point = z.object({ x: z.number(), y: z.number() });
const shapeId = (example: string) =>
    z.string().describe(`Caller-Assigned Unique ID, E.g. '${example}'`);

const boxShape = (example: string) =>
    z.object({
        id: shapeId(example),
        position: point,
        width: z.number(),
        height: z.number(),
        label: z.string().optional(),
    });

export const canvasToolDefs = {
    createRectangle: {
        description: "Create A Rectangle On The Canvas.",
        inputSchema: boxShape("rect-1"),
    },
    createEllipse: {
        description: "Create An Ellipse On The Canvas.",
        inputSchema: boxShape("ellipse-1"),
    },
    createText: {
        description: "Create A Text Label On The Canvas.",
        inputSchema: z.object({
            id: shapeId("text-1"),
            position: point,
            text: z.string(),
            fontSize: z.number().optional(),
        }),
    },
    createArrow: {
        description:
            "Create An Arrow Connecting Two Existing Shapes By Their IDs.",
        inputSchema: z.object({
            id: shapeId("arrow-1"),
            fromShapeId: z
                .string()
                .describe("ID Of The Shape This Arrow Starts At"),
            toShapeId: z
                .string()
                .describe("ID Of The Shape This Arrow Ends At"),
            label: z.string().optional(),
        }),
    },
    updateShape: {
        description: "Update An Existing Shape's Position, Size, Or Label.",
        inputSchema: z.object({
            id: z.string().describe("ID Of The Shape To Update"),
            position: point.optional(),
            width: z.number().optional(),
            height: z.number().optional(),
            label: z.string().optional(),
        }),
    },
    deleteShape: {
        description: "Delete A Shape From The Canvas.",
        inputSchema: z.object({
            id: z.string().describe("ID Of The Shape To Delete"),
        }),
    },
    createEntityTable: {
        description:
            "Create An ERD Entity-Table (A Database Table Box With A Name And Typed Columns) On The Canvas.",
        inputSchema: z.object({
            id: shapeId("table-users"),
            position: point,
            tableName: z.string(),
            columns: z
                .array(
                    z.object({
                        name: z.string(),
                        dataType: z
                            .string()
                            .describe(
                                "E.g. 'UUID', 'Text', 'Timestamptz', 'Int'",
                            ),
                        isPK: z.boolean().default(false),
                        isFK: z.boolean().default(false),
                    }),
                )
                .describe("Initial Columns, In Order"),
        }),
    },
    addColumn: {
        description: "Add A Column To An Existing Entity-Table.",
        inputSchema: z.object({
            tableId: z.string().describe("ID Of The Entity-Table"),
            name: z.string(),
            dataType: z.string(),
            isPK: z.boolean().default(false),
            isFK: z.boolean().default(false),
        }),
    },
    updateColumn: {
        description:
            "Update A Column On An Entity-Table (Rename, Retype, Or Toggle PK/FK).",
        inputSchema: z.object({
            tableId: z.string(),
            columnName: z.string().describe("Current Name Of The Column"),
            name: z.string().optional(),
            dataType: z.string().optional(),
            isPK: z.boolean().optional(),
            isFK: z.boolean().optional(),
        }),
    },
    removeColumn: {
        description: "Remove A Column From An Entity-Table.",
        inputSchema: z.object({
            tableId: z.string(),
            columnName: z.string(),
        }),
    },
    connectRelationship: {
        description:
            "Draw A Foreign-Key Arrow From A Primary-Key Column On One Entity-Table To The Matching Foreign-Key Column On Another.",
        inputSchema: z.object({
            id: shapeId("rel-1"),
            fromTableId: z
                .string()
                .describe("ID Of The Table On The Primary-Key Side"),
            fromColumnName: z
                .string()
                .describe("Name Of The Primary-Key Column"),
            toTableId: z
                .string()
                .describe("ID Of The Table On The Foreign-Key Side"),
            toColumnName: z.string().describe("Name Of The Foreign-Key Column"),
        }),
    },
};

const markdown = z
    .string()
    .describe(
        "Content As Markdown: Headings, Lists, Checklists, Tables, Code, Bold, Links",
    );

export const docToolDefs = {
    insertDocContent: {
        description:
            "Add Content To The Doc, At The End Or After A Given Block.",
        inputSchema: z.object({
            markdown,
            afterBlockId: z
                .string()
                .optional()
                .describe(
                    "Insert After This Block ID; Omit To Append At The End",
                ),
        }),
    },
    updateDocBlock: {
        description:
            "Rewrite One Existing Block Of The Doc (It May Become Several Blocks).",
        inputSchema: z.object({ blockId: z.string(), markdown }),
    },
    deleteDocBlocks: {
        description: "Delete Blocks From The Doc.",
        inputSchema: z.object({ blockIds: z.array(z.string()).min(1) }),
    },
    replaceDoc: {
        description:
            "Replace The Entire Doc. Use Only For A Full Rewrite Or A Brand-New Doc.",
        inputSchema: z.object({ markdown }),
    },
};

export const agentToolDefs = { ...canvasToolDefs, ...docToolDefs };

export type ToolResult = { success: true } | { success: false; error: string };

export const ok = (): ToolResult => ({ success: true });
export const fail = (error: string): ToolResult => ({ success: false, error });

export function normalizeModelText(text: string) {
    return text.includes("\n") ? text : text.replace(/\\n/g, "\n");
}
