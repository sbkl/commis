"use client";

import { Authenticated } from "convex/react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

interface EditorProps {
  defaultLayout: number[];
}
export function Editor({ defaultLayout = [20, 100] }: EditorProps) {
  const onLayout = (sizes: number[]) => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
  };
  return (
    <Authenticated>
      <PanelGroup direction="horizontal" onLayout={onLayout}>
        <Panel
          defaultSize={defaultLayout[0]}
          minSize={20}
          maxSize={30}
          collapsible
        >
          <div className="w-full h-full px-6 py-12">
            {/* <NewProjectForm /> */}
          </div>
        </Panel>
        <PanelResizeHandle className="bg-border/50  w-1 hover:cursor-col-resize" />
        <Panel defaultSize={defaultLayout[1]} minSize={10} collapsible>
          <div className=" w-full h-full"></div>
        </Panel>
      </PanelGroup>
    </Authenticated>
  );
}
