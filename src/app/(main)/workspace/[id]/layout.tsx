import React from "react";

const WorkspaceLayout = ({ children }: LayoutProps<"/workspace/[id]">) => {
    return <div className="flex flex-1 flex-col">{children}</div>;
};

export default WorkspaceLayout;
