"use client";

import * as React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { vscodeDark, vscodeLight } from "@uiw/codemirror-theme-vscode";
import { ScrollArea } from "@commis/ui/components/scroll-area";
import { cn } from "@commis/ui/lib/utils";
import {
  FileCode,
  FileJson,
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  Download,
  FilePlus,
  FolderPlus,
} from "lucide-react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useTheme } from "next-themes";
import { useQuery } from "@/hooks/use-query";
import { api } from "@commis/api/src/convex/_generated/api";
import { Id } from "@commis/api/src/convex/_generated/dataModel";
import { Button } from "@commis/ui/components/button";

// ============================================================================
// TYPE DEFINITIONS - This is what we'll need in the database
// ============================================================================

type CodeFile =
  (typeof api.codeFeatures.query.list._returnType)[number]["files"][number];

// ============================================================================
// FILE TREE UTILITIES
// ============================================================================

interface FileNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
  file?: CodeFile;
}

function buildFileTree(files: CodeFile[]): FileNode[] {
  const root: FileNode[] = [];

  files.forEach((file) => {
    const parts = file.path.split("/");
    let currentLevel = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const existingNode = currentLevel.find((node) => node.name === part);

      if (existingNode) {
        if (!isFile && existingNode.children) {
          currentLevel = existingNode.children;
        }
      } else {
        const newNode: FileNode = {
          name: part,
          path: parts.slice(0, index + 1).join("/"),
          type: isFile ? "file" : "folder",
          ...(isFile ? { file } : { children: [] }),
        };

        currentLevel.push(newNode);

        if (!isFile && newNode.children) {
          currentLevel = newNode.children;
        }
      }
    });
  });

  return root;
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "json":
      return <FileJson className="w-4 h-4 text-yellow-500" />;
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return <FileCode className="w-4 h-4 text-blue-500" />;
    case "css":
      return <FileCode className="w-4 h-4 text-purple-500" />;
    default:
      return <FileText className="w-4 h-4 text-gray-500" />;
  }
}

// ============================================================================
// FILE TREE COMPONENT
// ============================================================================

interface FileTreeNodeProps {
  node: FileNode;
  level: number;
  selectedFile: string | null;
  onSelectFile: (file: CodeFile) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
}

function FileTreeNode({
  node,
  level,
  selectedFile,
  onSelectFile,
  expandedFolders,
  onToggleFolder,
}: FileTreeNodeProps) {
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedFile === node.path;

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => onToggleFolder(node.path)}
          className={cn(
            "w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent rounded-md transition-colors",
            "text-left"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <ChevronRight
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0",
              {
                "rotate-90": isExpanded,
              }
            )}
          />
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-blue-500 shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-blue-500 shrink-0" />
          )}
          <span className="text-foreground line-clamp-1">{node.name}</span>
        </button>
        {isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <FileTreeNode
                key={child.path}
                node={child}
                level={level + 1}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => node.file && onSelectFile(node.file)}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent/80 rounded-md transition-colors",
        "text-left",
        { "bg-accent/50": isSelected }
      )}
      style={{ paddingLeft: `${level * 12 + 32}px` }}
    >
      <div className="shrink-0">{getFileIcon(node.name)}</div>
      <span className="text-foreground line-clamp-1">{node.name}</span>
    </button>
  );
}

interface FileTreeProps {
  files: CodeFile[];
  selectedFile: string | null;
  onSelectFile: (file: CodeFile) => void;
}

function FileTree({ files, selectedFile, onSelectFile }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(
    new Set(["components", "lib", "examples"])
  );

  const fileTree = React.useMemo(() => buildFileTree(files), [files]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="p-2">
      {fileTree.map((node) => (
        <FileTreeNode
          key={node.path}
          node={node}
          level={0}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
          expandedFolders={expandedFolders}
          onToggleFolder={toggleFolder}
        />
      ))}
    </div>
  );
}

// ============================================================================
// LANGUAGE EXTENSIONS FOR CODEMIRROR
// ============================================================================

function getLanguageExtension(language: CodeFile["language"]) {
  switch (language) {
    case "typescript":
    case "javascript":
      return javascript({ jsx: true, typescript: true });
    case "css":
      return css();
    case "html":
      return html();
    case "json":
      return json();
    default:
      return javascript();
  }
}

// ============================================================================
// MAIN CODE EDITOR COMPONENT
// ============================================================================

export function CodeEditor() {
  const onLayout = (sizes: number[]) => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
  };
  const { data: features } = useQuery(api.codeFeatures.query.list, {});
  const feature = features?.[0];
  const [selectedFileId, setSelectedFileId] =
    React.useState<Id<"codeFeatureFiles"> | null>(null);

  const { theme, systemTheme } = useTheme();

  // Derive selected file from query data based on ID
  const selectedFile = React.useMemo(
    () => feature?.files.find((file) => file._id === selectedFileId) ?? null,
    [feature?.files, selectedFileId]
  );

  if (!feature) return null;
  return (
    <div>
      <div className="h-[var(--main-header-height)] flex items-center justify-between px-4 border-b">
        <h1 className="font-bold">{feature.name}</h1>
        <div>
          <Button variant="outline" size="sm" icon={Download}>
            Install
          </Button>
        </div>
      </div>
      <PanelGroup
        direction="horizontal"
        className="flex h-[var(--code-editor-height)]"
        onLayout={onLayout}
      >
        {/* File Navigation Sidebar */}
        <Panel
          defaultSize={20}
          minSize={10}
          maxSize={40}
          className="border-r border-border bg-card shrink-0"
        >
          <div className="px-4 border-b border-border h-[var(--code-editor-header-height)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="font-semibold text-sm">Files</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                {feature.files.length} files
              </span>
            </div>
            <div>
              <Button variant="ghost" size="icon" className="group size-7">
                <FilePlus className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="group size-7">
                <FolderPlus className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              </Button>
            </div>
          </div>
          <ScrollArea className="h-[var(--code-editor-content-height)]">
            <FileTree
              files={feature.files}
              selectedFile={selectedFile?.path ?? null}
              onSelectFile={(file) => setSelectedFileId(file._id)}
            />
          </ScrollArea>
        </Panel>

        <PanelResizeHandle />
        {/* Code Editor Area */}
        <Panel className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              {/* File Tab/Header */}
              <div className="flex items-center gap-2 px-4 h-[var(--code-editor-header-height)] border-b border-border">
                {getFileIcon(selectedFile.path)}
                <span className="text-sm font-medium">{selectedFile.path}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {selectedFile.language}
                </span>
              </div>

              {/* Editor */}
              <ScrollArea className="h-[var(--code-editor-content-height)]">
                <CodeMirror
                  value={selectedFile.content}
                  height="var(--code-editor-content-height)"
                  theme={
                    theme === "system"
                      ? systemTheme === "dark"
                        ? vscodeDark
                        : vscodeLight
                      : theme === "dark"
                        ? vscodeDark
                        : vscodeLight
                  }
                  extensions={[getLanguageExtension(selectedFile.language)]}
                  onChange={(value) => {
                    // In a real app, you'd update the file content here
                    console.log("File changed:", value);
                  }}
                  basicSetup={{
                    lineNumbers: true,
                    highlightActiveLineGutter: true,
                    highlightActiveLine: true,
                    foldGutter: true,
                    dropCursor: true,
                    allowMultipleSelections: true,
                    indentOnInput: true,
                    bracketMatching: true,
                    closeBrackets: true,
                    autocompletion: true,
                    rectangularSelection: true,
                    crosshairCursor: true,
                    highlightSelectionMatches: true,
                    closeBracketsKeymap: true,
                    searchKeymap: true,
                    foldKeymap: true,
                    completionKeymap: true,
                    lintKeymap: true,
                  }}
                  className="text-sm"
                />
              </ScrollArea>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileCode className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a file to view</p>
              </div>
            </div>
          )}
        </Panel>
      </PanelGroup>
    </div>
  );
}
