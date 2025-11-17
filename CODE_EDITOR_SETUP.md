# Code Editor Setup & Implementation Guide

## What Was Built

A fully functional **CodeMirror-based code editor** with:
- ✅ File tree navigation with expand/collapse
- ✅ Multiple file support
- ✅ Syntax highlighting (TypeScript, JavaScript, CSS, HTML, JSON)
- ✅ VS Code dark theme
- ✅ File icons based on extension
- ✅ Real-time code editing
- ✅ Responsive layout integrated with existing project UI

## Tech Stack & Libraries

### Installed Dependencies

```json
{
  "@codemirror/lang-css": "^6.3.1",          // CSS syntax highlighting
  "@codemirror/lang-html": "^6.4.9",         // HTML syntax highlighting
  "@codemirror/lang-javascript": "^6.2.2",   // JS/TS syntax highlighting
  "@codemirror/lang-json": "^6.0.1",         // JSON syntax highlighting
  "@uiw/codemirror-theme-vscode": "^4.23.6", // VS Code theme
  "@uiw/react-codemirror": "^4.23.6",        // React wrapper for CodeMirror
  "clsx": "^2.1.1"                           // Utility for className management
}
```

### Why These Libraries?

**CodeMirror 6** (`@uiw/react-codemirror`)
- Modern, extensible code editor
- Excellent performance with large files
- Rich ecosystem of language support
- Active development and maintenance
- Better than Monaco for lightweight use cases

**Language Packages** (`@codemirror/lang-*`)
- Official language support packages
- Syntax highlighting and code intelligence
- Tree-based parsing for accuracy
- Each language can be imported separately (tree-shakeable)

**VS Code Theme** (`@uiw/codemirror-theme-vscode`)
- Familiar developer experience
- Dark mode support (matches your app)
- Professional appearance

### Already Using (from your existing stack)

- ✅ **Lucide React** - Icons for file tree
- ✅ **ScrollArea** - Radix UI scroll component
- ✅ **Tailwind CSS** - Styling
- ✅ **cn utility** - ClassName merging

## Installation Steps

### 1. Install Dependencies

```bash
cd apps/web
bun install
```

This will install all the new CodeMirror dependencies added to `package.json`.

### 2. Test the Editor

The editor is already integrated into your project layout at:
- **Location**: `apps/web/src/components/code-editor.tsx`
- **Used in**: `apps/web/src/components/projects/content.tsx`

It will display when a project's status is `"created"`.

### 3. View in Browser

```bash
# Start the dev server (if not already running)
cd apps/web
bun run dev
```

Navigate to a project that has `status: "created"` to see the code editor.

## File Structure

```
apps/web/src/components/
  └─ code-editor.tsx          # Main editor component
  
Inside code-editor.tsx:
  ├─ Type Definitions         # TypeScript interfaces for data structure
  ├─ Placeholder Data         # Example component with multiple files
  ├─ File Tree Utilities      # Build tree structure from flat files
  ├─ FileTreeNode Component   # Recursive tree rendering
  ├─ FileTree Component       # Main tree component with state
  ├─ Language Extensions      # CodeMirror language configuration
  └─ CodeEditor Component     # Main export
```

## Data Structure Explained

### What the Database Needs to Store

```typescript
interface CodeComponent {
  // Basic Info
  id: string;
  name: string;
  description: string;
  
  // Files - THIS IS THE KEY PART
  files: Array<{
    path: string;      // "components/Button.tsx"
    content: string;   // Full file content as text
    language: "typescript" | "javascript" | "css" | "html" | "json" | "markdown";
  }>;
  
  // Dependencies (for installation)
  dependencies?: Record<string, string>;  // { "react": "^18.0.0" }
  
  // Metadata
  framework?: "react" | "vue" | "vanilla" | "nextjs";
  tags?: string[];
}
```

### Example Data (Currently Using Placeholder)

```typescript
{
  id: "btn-001",
  name: "Animated Button Component",
  files: [
    {
      path: "components/Button.tsx",
      content: "import * as React from 'react'...",
      language: "typescript"
    },
    {
      path: "components/Button.css",
      content: ".button { display: flex... }",
      language: "css"
    },
    // ... more files
  ],
  dependencies: {
    "react": "^18.0.0",
    "framer-motion": "^11.0.0"
  }
}
```

## How It Works

### File Tree
1. **Flat to Tree**: Takes flat array of files and builds nested tree structure
2. **Recursive Rendering**: Folders and files render recursively
3. **Expand/Collapse**: State-managed folder expansion
4. **Selection**: Tracks selected file for highlighting

### Code Editor
1. **File Selection**: Click file in tree → loads content
2. **Syntax Highlighting**: Automatically applies based on `language` field
3. **Theme**: VS Code dark theme matches your app
4. **Editing**: Ready for read/write (currently logs changes)

## Current Features

✅ **File Navigation**
- Hierarchical folder structure
- Expand/collapse folders
- File type icons
- Selected file highlighting

✅ **Code Display**
- Syntax highlighting for multiple languages
- Line numbers
- Code folding
- Bracket matching
- Active line highlighting

✅ **Developer Experience**
- VS Code-like appearance
- Keyboard shortcuts
- Search within file (Cmd/Ctrl + F)
- Auto-completion
- Bracket closing

## Next Steps for Full Implementation

### Phase 1: Database Integration (Convex)

1. **Create Schema** (`packages/api/src/convex/schema.ts`)
```typescript
codeComponents: defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.string(),
  files: v.array(v.object({
    path: v.string(),
    content: v.string(),
    language: v.union(
      v.literal("typescript"),
      v.literal("javascript"),
      v.literal("css"),
      v.literal("html"),
      v.literal("json")
    ),
  })),
  dependencies: v.optional(v.record(v.string(), v.string())),
  framework: v.optional(v.string()),
  tags: v.array(v.string()),
  userId: v.id("users"),
  isPublic: v.boolean(),
}).index("by_slug", ["slug"]),
```

2. **Create Queries** (`packages/api/src/convex/codeComponents/query.ts`)
```typescript
export const list = query({ ... });
export const getBySlug = query({ ... });
export const getById = query({ ... });
```

3. **Create Mutations** (`packages/api/src/convex/codeComponents/mutation.ts`)
```typescript
export const create = mutation({ ... });
export const update = mutation({ ... });
export const delete = mutation({ ... });
```

### Phase 2: Web App Integration

1. **Connect to Convex**
```typescript
// In CodeEditor component
const { data: component } = useQuery(api.codeComponents.getById, {
  id: componentId
});

// Replace PLACEHOLDER_COMPONENT with real data
```

2. **Component Library Page**
```typescript
// New page: app/(app)/components/page.tsx
- List all public components
- Search and filter
- Click to view details
```

3. **Component Detail Page**
```typescript
// New page: app/(app)/components/[slug]/page.tsx
- Show CodeEditor with component files
- Installation instructions
- Copy command button
```

### Phase 3: CLI Installation

1. **Add Install Command** (`apps/cli/src/functions/install.ts`)
```typescript
export async function install(slug: string) {
  // Authenticate
  // Fetch component
  // Write files to disk
  // Handle dependencies
  // Success message
}
```

2. **Register Command** (`apps/cli/src/index.ts`)
```typescript
program
  .command('install <slug>')
  .description('Install a code component')
  .action(install);
```

### Phase 4: Live Preview (Optional, Advanced)

If you want users to see the component running live:

**Option A: Sandpack** (Recommended)
```bash
bun add @codesandbox/sandpack-react
```
- Runs React components in isolated iframe
- Supports npm packages
- Live editing and preview

**Option B: Custom Preview**
- Use esbuild-wasm to bundle on client
- Render in isolated iframe
- More control but more complex

### Phase 5: Component Publishing

1. **Upload Form** (Web)
```typescript
// New page: app/(app)/components/new/page.tsx
- Multi-file upload
- Metadata form
- Preview before publish
```

2. **Publish Command** (CLI)
```bash
commis publish ./src/components/Button
```
- Scan directory
- Detect files
- Upload to Convex
- Generate slug

## Testing the Current Implementation

### Visual Check
1. Install dependencies: `bun install`
2. Start dev server: `bun run dev`
3. Navigate to a project with `status: "created"`
4. You should see:
   - Left sidebar with file tree
   - Right panel with code editor
   - Syntax highlighted code
   - Clickable file navigation

### Interactive Test
1. Click different files in the tree
2. Folders should expand/collapse
3. Selected file should highlight
4. Code should update in editor
5. Syntax highlighting should match file type

### Check Browser Console
- Should see file changes logged when editing
- No errors in console

## Troubleshooting

### "Module not found: @uiw/react-codemirror"
```bash
cd apps/web
bun install
```

### Editor not showing
- Check project status is `"created"`
- Check `ProjectContent` component in `content.tsx`
- Look for errors in browser console

### Styling issues
- Ensure Tailwind is processing the file
- Check dark mode theme is active
- Verify globals.css is imported

### File tree not expanding
- Check console for errors
- Verify placeholder data structure
- Check `buildFileTree` function logic

## Customization Options

### Change Theme
```typescript
import { githubLight } from "@uiw/codemirror-theme-github";

<CodeMirror theme={githubLight} />
```

Available themes:
- `vscodeDark` (current)
- `vscodeLight`
- `githubLight`
- `githubDark`
- `dracula`
- `tokyoNight`
- `solarizedLight`

### Add More Languages
```bash
bun add @codemirror/lang-python
bun add @codemirror/lang-rust
bun add @codemirror/lang-markdown
```

Then update `getLanguageExtension()` function.

### Readonly Mode
```typescript
<CodeMirror
  editable={false}
  readOnly={true}
  // ... other props
/>
```

### Custom Height
```typescript
<CodeMirror height="600px" />
```

## Performance Considerations

- ✅ CodeMirror is highly optimized for large files
- ✅ File tree only re-renders on file change
- ✅ Syntax highlighting is incremental
- ✅ Each language extension is tree-shakeable

For extremely large components (>100 files):
- Consider pagination or lazy loading in file tree
- Virtualize the file tree with `react-window`
- Load file content on-demand instead of all at once

## Summary

You now have:
1. ✅ **Working Code Editor** with syntax highlighting
2. ✅ **File Navigation** with tree structure
3. ✅ **Clear Data Structure** for database implementation
4. ✅ **Path Forward** for full feature completion

See `CODE_COMPONENTS_SPEC.md` for detailed database schema and implementation details.

Ready to move forward with Convex integration or CLI implementation!

