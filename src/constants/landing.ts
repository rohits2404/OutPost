import { LayoutGrid, FileText, KanbanSquare } from "lucide-react";
import { CanvasMock, DocsMock, BoardMock } from "../components/SurfaceVisuals";

export const AUDIENCES = [
    "Product Teams",
    "Founders",
    "Solo Builders",
    "Design Agencies",
    "Consultants",
];

export const SURFACES = [
    {
        icon: LayoutGrid,
        title: "Canvas",
        description:
            "An Infinite Whiteboard Where The Agent Drafts Flowcharts, Architecture Diagrams, And Journeys Shape By Shape, Instead Of Hiding It All Behind A Black-Box Generate Button.",
        bullets: [
            "Templates For Flowcharts, ERDs, Architecture, And Org Charts",
            "Follow-Up Edits: Ask For Changes And It Edits Shapes In Place",
            "ERD Tables With Typed Columns And Key Badges",
        ],
        visual: CanvasMock,
    },
    {
        icon: FileText,
        title: "Docs",
        description:
            "Turn Any Diagram Into A Written Spec. The Agent Drafts, Rewrites, And Summarizes In A Block-Based Editor, Pulling Structure Straight From What's On The Canvas.",
        bullets: [
            "Block-Based Editor: Headings, Lists, Checklists, Tables, Code",
            '"Write This Diagram Up As A Spec" Pulls Structure Automatically',
            "Rewrite Or Summarize Any Section On Command",
        ],
        visual: DocsMock,
    },
    {
        icon: KanbanSquare,
        title: "Team Board",
        description:
            "Every Workspace In Your Organization Lives On One Shared Board. Drag It From Planning To Done, And Jump In With Teammates, With Live Cursors On The Canvas And In The Doc.",
        bullets: [
            "One Kanban Board For Every Workspace In Your Org",
            "Live Cursors And Edits On The Canvas And In Docs",
            "Anyone In Your Org Can Join Any Workspace Instantly",
        ],
        visual: BoardMock,
    },
];

export const STEPS = [
    {
        title: "Describe What You Need",
        body: "Just Say “Map Out Our Onboarding Flow.” Plain Language, No Diagramming Syntax To Learn. Or Just Talk: Voice Input Works Too.",
    },
    {
        title: "Watch The Agent Draw",
        body: "Shapes Appear One By One As The Agent Works, The Same Way a Teammate Would Draw Over a Call.",
    },
    {
        title: "Keep Iterating Together",
        body: "Ask For Changes, Pull It Into a Doc, Or Bring In Your Team. Same Agent, Same Context.",
    },
];
