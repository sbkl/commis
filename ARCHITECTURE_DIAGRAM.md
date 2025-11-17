# Code Components Feature - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACES                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐         ┌──────────────────────────┐  │
│  │   WEB APP (Next.js) │         │    CLI (Node.js)         │  │
│  │                     │         │                          │  │
│  │  Component Library  │         │  $ commis install btn    │  │
│  │  ├─ Browse          │         │                          │  │
│  │  ├─ Search          │         │  ├─ Fetch from Convex    │  │
│  │  └─ Preview         │         │  ├─ Write files locally  │  │
│  │                     │         │  ├─ Install dependencies │  │
│  │  Code Editor        │         │  └─ Success message      │  │
│  │  ├─ File Tree       │         │                          │  │
│  │  ├─ CodeMirror      │         └──────────────────────────┘  │
│  │  └─ Syntax HL       │                                        │
│  │                     │                                        │
│  └─────────────────────┘                                        │
│                                                                  │
└──────────────────┬────────────────────────────┬─────────────────┘
                   │                            │
                   │         Convex API         │
                   │                            │
┌──────────────────▼────────────────────────────▼─────────────────┐
│                      CONVEX BACKEND                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ codeComponents Table                                       │ │
│  │                                                            │ │
│  │  {                                                         │ │
│  │    _id: "abc123",                                         │ │
│  │    name: "Animated Button",                              │ │
│  │    slug: "animated-button",                              │ │
│  │    files: [                                              │ │
│  │      { path: "Button.tsx", content: "...", lang: "ts" } │ │
│  │      { path: "Button.css", content: "...", lang: "css" }│ │
│  │    ],                                                    │ │
│  │    dependencies: { "react": "^18.0.0" },                │ │
│  │    tags: ["ui", "button"],                              │ │
│  │    userId: "user123",                                   │ │
│  │    isPublic: true                                       │ │
│  │  }                                                         │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Queries:                   Mutations:                          │
│  ├─ list()                 ├─ create()                         │
│  ├─ getBySlug()            ├─ update()                         │
│  ├─ getById()              ├─ delete()                         │
│  ├─ searchByTag()          └─ incrementDownloads()             │
│  └─ myComponents()                                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Web App: Browse & Preview

```
User visits /components
        ↓
Query: list() → Fetch all public components
        ↓
Display component cards
        ↓
User clicks component
        ↓
Navigate to /components/[slug]
        ↓
Query: getBySlug(slug) → Fetch component with files
        ↓
Build file tree from files array
        ↓
Display CodeEditor with files
        ↓
User clicks file in tree
        ↓
CodeMirror updates with file.content
        ↓
Syntax highlighting based on file.language
```

### CLI: Install Component

```
$ commis install animated-button
        ↓
Authenticate user
        ↓
Query: getBySlug("animated-button")
        ↓
Receive component data
        ↓
Parse files array
        ↓
For each file:
  ├─ Create directory structure
  ├─ Write file.content to disk at file.path
  └─ Log success
        ↓
Check dependencies
        ↓
If new dependencies:
  ├─ Display list
  ├─ Prompt to install
  └─ Run npm/bun install
        ↓
Mutation: incrementDownloads(componentId)
        ↓
Success message
```

## Component Structure

### Web App Components

```
apps/web/src/
├─ app/
│  └─ (app)/
│     └─ components/                    # NEW: Component library
│        ├─ page.tsx                   # List all components
│        ├─ [slug]/
│        │  └─ page.tsx               # Component detail & preview
│        └─ new/
│           └─ page.tsx               # Publish new component
│
└─ components/
   ├─ code-editor.tsx                 # ✅ CREATED
   │  ├─ FileTree                     # File navigation
   │  ├─ FileTreeNode                 # Recursive tree rendering
   │  └─ CodeEditor                   # Main editor
   │
   └─ component-library/              # NEW: To be created
      ├─ component-card.tsx           # Component preview card
      ├─ component-search.tsx         # Search & filter
      └─ install-dialog.tsx           # Installation instructions
```

### Convex Backend

```
packages/api/src/convex/
├─ schema.ts                          # Add codeComponents table
│
└─ codeComponents/                    # NEW: To be created
   ├─ table.ts                        # Table definition
   ├─ query.ts                        # Read operations
   ├─ mutation.ts                     # Write operations
   └─ cli/
      ├─ query.ts                     # CLI-specific queries
      └─ mutation.ts                  # Track installations
```

### CLI Commands

```
apps/cli/src/
├─ index.ts                           # Register commands
│
└─ functions/
   ├─ install.ts                      # NEW: Install component
   ├─ publish.ts                      # NEW: Publish component
   └─ list.ts                         # NEW: List available components
```

## Technology Stack

### Frontend (Web App)

| Library | Purpose | Why |
|---------|---------|-----|
| **@uiw/react-codemirror** | Code editor | Modern, performant, React-friendly |
| **@codemirror/lang-*** | Syntax highlighting | Official language support |
| **@uiw/codemirror-theme-vscode** | Editor theme | Familiar developer experience |
| **lucide-react** | Icons | Already in use, consistent |
| **@radix-ui/scroll-area** | Scrolling | Already in use, accessible |

### Backend (Convex)

| Feature | Implementation |
|---------|----------------|
| **Storage** | Convex tables (native) |
| **Queries** | Convex queries (reactive) |
| **Mutations** | Convex mutations (transactional) |
| **Auth** | Convex Auth (already integrated) |

### CLI

| Library | Purpose |
|---------|---------|
| **convex** | Database client |
| **fs/promises** | File operations |
| **execa** | Run package manager |
| **chalk** | Colored output |

## File Format in Database

### Minimal Example
```typescript
{
  name: "Simple Button",
  slug: "simple-button",
  files: [
    {
      path: "Button.tsx",
      content: "export function Button() { ... }",
      language: "typescript"
    }
  ]
}
```

### Full Example
```typescript
{
  _id: "cmp_001",
  name: "Animated Button Component",
  slug: "animated-button",
  description: "A button with smooth animations",
  
  files: [
    {
      path: "components/Button/index.tsx",
      content: "import * as React from 'react';\n...",
      language: "typescript"
    },
    {
      path: "components/Button/Button.css",
      content: ".button { display: flex; ... }",
      language: "css"
    },
    {
      path: "components/Button/types.ts",
      content: "export interface ButtonProps { ... }",
      language: "typescript"
    },
    {
      path: "examples/usage.tsx",
      content: "import { Button } from '../components/Button';\n...",
      language: "typescript"
    }
  ],
  
  dependencies: {
    "react": "^18.0.0",
    "clsx": "^2.0.0",
    "framer-motion": "^11.0.0"
  },
  
  framework: "react",
  tags: ["ui", "button", "animation"],
  category: "form-controls",
  
  userId: "usr_123",
  isPublic: true,
  isTemplate: false,
  
  thumbnail: "https://...",
  version: "1.0.0",
  downloads: 42,
  stars: 15,
  
  installPath: "src/components",
  
  createdAt: 1699564800000,
  updatedAt: 1699564800000
}
```

## User Journeys

### Journey 1: Browse & Install (Web → CLI)

```
1. Developer visits commis.app/components
2. Browses component library
3. Sees "Animated Button" component
4. Clicks to view details
5. Sees:
   - Preview of the component
   - File tree structure
   - Code in CodeMirror editor
   - Dependencies list
   - Installation command
6. Copies: `commis install animated-button`
7. Runs command in terminal
8. Files appear in local project
9. Dependencies can be installed
10. Component ready to use!
```

### Journey 2: Create & Share (Local → Web)

```
1. Developer creates awesome component locally
2. Runs: `commis publish ./src/components/MyComponent`
3. CLI scans directory
4. Prompts for:
   - Name
   - Description
   - Tags
   - Public/Private
5. Uploads to Convex
6. Component appears on commis.app/components
7. Other developers can now install it!
```

### Journey 3: Preview Only (Web)

```
1. Developer learning React
2. Visits commis.app/components
3. Searches: "data table"
4. Opens "Advanced Data Table"
5. Explores files in CodeMirror:
   - Reads implementation
   - Sees patterns and techniques
   - Learns from examples
6. No installation needed!
```

## Current Status

### ✅ Completed
- [x] CodeMirror integration
- [x] File tree navigation
- [x] Multi-file support
- [x] Syntax highlighting (TS, JS, CSS, HTML, JSON)
- [x] VS Code theme
- [x] Responsive layout
- [x] Type definitions
- [x] Example data structure
- [x] Documentation

### 🚧 Next Steps
- [ ] Convex schema for codeComponents
- [ ] Convex queries & mutations
- [ ] Web: Component library page
- [ ] Web: Component detail page
- [ ] CLI: install command
- [ ] CLI: publish command
- [ ] CLI: list command

### 🎯 Future Enhancements
- [ ] Live preview with Sandpack
- [ ] Component search & filtering
- [ ] User profiles & collections
- [ ] Component ratings & reviews
- [ ] Dependency compatibility checking
- [ ] Automated testing for components
- [ ] Version management
- [ ] Component templates/starters
- [ ] AI-powered search
- [ ] Component playground

## Design Decisions

### Why CodeMirror over Monaco?
- ✅ Lighter weight (~200KB vs ~3MB)
- ✅ Better tree-shaking
- ✅ Modern architecture (CodeMirror 6)
- ✅ Excellent React integration
- ❌ Less features than VS Code (acceptable tradeoff)

### Why Store Full File Content?
- ✅ Simple to query and retrieve
- ✅ No dependency on external file storage
- ✅ Easy to preview in browser
- ✅ Fast to install via CLI
- ❌ Convex has generous limits
- ❌ Can compress if needed

### Why Flat Files Array?
- ✅ Simple database structure
- ✅ Easy to map to file system
- ✅ Query-friendly
- ✅ Build tree structure on client
- ❌ More flexible than nested objects

### Why Slug-based URLs?
- ✅ Human-readable: `/components/animated-button`
- ✅ SEO-friendly
- ✅ Easy to share
- ✅ Memorable for CLI: `commis install animated-button`

## Scaling Considerations

### Performance
- CodeMirror handles files up to 100MB
- File tree pagination for 1000+ files
- Lazy load file content if needed
- Search indexing for fast queries

### Storage
- Convex free tier: 1GB storage
- Average component: ~50KB
- = ~20,000 components
- Can upgrade or add CDN

### Bandwidth
- Cache file content on client
- Compress large files
- Incremental loading
- Edge caching with CDN

## Security Considerations

- ✅ User authentication required for private components
- ✅ Validate file paths (prevent directory traversal)
- ✅ Sanitize file content (prevent XSS in preview)
- ✅ Rate limiting on publish/install
- ✅ Virus/malware scanning (future)
- ✅ Content moderation (future)

## Summary

This architecture provides:
1. **Simple but powerful** code component storage
2. **Rich preview experience** with CodeMirror
3. **Easy installation** via CLI
4. **Scalable foundation** for growth
5. **Developer-friendly** APIs and tools

Ready to implement! 🚀

