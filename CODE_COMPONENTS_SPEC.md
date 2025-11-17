# Code Components - Database Schema & Format Specification

This document outlines the data structure needed to store and manage code components that can be previewed in the web app and installed via CLI.

## Overview

Based on the CodeMirror implementation, we need to store:
1. **Component metadata** (name, description, tags)
2. **Multiple files** with their paths and content
3. **Dependencies** (npm packages)
4. **Framework information** (React, Vue, etc.)

## Database Schema (Convex)

### Table: `codeComponents`

```typescript
{
  // Identification
  _id: Id<"codeComponents">
  _creationTime: number
  
  // Metadata
  name: string                    // "Animated Button Component"
  slug: string                    // "animated-button" (URL-friendly, unique)
  description: string             // "A beautiful animated button..."
  
  // Ownership & Association
  userId: Id<"users">            // Creator
  projectId?: Id<"projects">     // Optional project association
  
  // Files Structure
  files: Array<{
    path: string                  // "components/Button.tsx"
    content: string               // Full file content
    language: "typescript" | "javascript" | "css" | "html" | "json" | "markdown"
  }>
  
  // Dependencies (for preview & installation)
  dependencies?: Record<string, string>  // { "react": "^18.0.0", "clsx": "^2.0.0" }
  
  // Framework/Template
  framework?: "react" | "vue" | "vanilla" | "nextjs" | "svelte"
  
  // Categorization
  tags: string[]                 // ["ui", "button", "animation"]
  category?: string              // "form-controls", "layout", "data-display"
  
  // Visibility
  isPublic: boolean              // Public or private
  isTemplate: boolean            // Is this a starter template?
  
  // Media
  thumbnail?: string             // URL or file storage ID
  screenshots?: string[]         // Array of image URLs
  
  // Installation info
  installPath?: string           // Default install path: "src/components"
  installCommand?: string        // Custom install command if needed
  
  // Metadata
  version: string                // "1.0.0"
  downloads: number              // Download count
  stars: number                  // Star/like count
  
  // Timestamps
  updatedAt: number
}
```

## File Structure Format

### Example 1: Simple Component

```typescript
const simpleComponent = {
  name: "Card Component",
  slug: "card-component",
  description: "A simple card component with shadow and border",
  files: [
    {
      path: "components/Card.tsx",
      content: `export function Card({ children }) {
  return <div className="card">{children}</div>;
}`,
      language: "typescript"
    },
    {
      path: "components/Card.css",
      content: `.card {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}`,
      language: "css"
    }
  ],
  framework: "react",
  tags: ["ui", "card", "container"],
  isPublic: true
}
```

### Example 2: Complex Component with Multiple Files

```typescript
const complexComponent = {
  name: "Data Table with Pagination",
  slug: "data-table-pagination",
  description: "A full-featured data table with sorting, filtering, and pagination",
  files: [
    {
      path: "components/DataTable/index.tsx",
      content: "// Main table component...",
      language: "typescript"
    },
    {
      path: "components/DataTable/TableHeader.tsx",
      content: "// Header component...",
      language: "typescript"
    },
    {
      path: "components/DataTable/TableRow.tsx",
      content: "// Row component...",
      language: "typescript"
    },
    {
      path: "components/DataTable/Pagination.tsx",
      content: "// Pagination component...",
      language: "typescript"
    },
    {
      path: "components/DataTable/types.ts",
      content: "// TypeScript types...",
      language: "typescript"
    },
    {
      path: "components/DataTable/styles.css",
      content: "// Styles...",
      language: "css"
    },
    {
      path: "hooks/useTableSort.ts",
      content: "// Custom hook for sorting...",
      language: "typescript"
    },
    {
      path: "examples/usage.tsx",
      content: "// Usage example...",
      language: "typescript"
    }
  ],
  dependencies: {
    "react": "^18.0.0",
    "clsx": "^2.0.0",
    "@tanstack/react-table": "^8.0.0"
  },
  framework: "react",
  tags: ["ui", "table", "data-display", "pagination"],
  category: "data-display",
  installPath: "src/components/DataTable",
  isPublic: true
}
```

## File Path Conventions

### Recommended Structure
```
components/
  ├─ ComponentName/
  │  ├─ index.tsx          # Main component
  │  ├─ SubComponent.tsx   # Sub-components
  │  ├─ types.ts           # TypeScript types
  │  └─ styles.css         # Styles
  ├─ ComponentName.tsx     # Single-file component
  └─ ComponentName.css     # Accompanying styles

hooks/
  └─ useCustomHook.ts      # Custom hooks

lib/
  └─ utils.ts              # Utility functions

examples/
  └─ usage.tsx             # Usage examples

tests/
  └─ ComponentName.test.tsx # Tests (optional)
```

## Language Types

Supported languages for syntax highlighting:
- `typescript` - .ts, .tsx files
- `javascript` - .js, .jsx files
- `css` - .css files
- `html` - .html files
- `json` - .json files
- `markdown` - .md files

Future support could include:
- `scss` - .scss files
- `python` - .py files
- `yaml` - .yml, .yaml files

## Dependencies Format

Dependencies follow npm's `package.json` format:

```typescript
dependencies: {
  "package-name": "version-spec"
}
```

Examples:
```typescript
{
  "react": "^18.0.0",           // Caret: compatible with
  "clsx": "~2.0.0",             // Tilde: approximately
  "lodash": "4.17.21",          // Exact version
  "next": "latest",             // Latest version (not recommended)
  "framer-motion": ">=11.0.0"   // Greater than or equal
}
```

## Installation Flow

### Web App Flow
```
User browses components
  ↓
Clicks on component
  ↓
Component page loads:
  - Fetch component data from Convex
  - Build file tree from files array
  - Initialize CodeMirror with first file
  ↓
User navigates files:
  - Click file in tree
  - CodeMirror updates with file content
  - Syntax highlighting based on language
  ↓
User copies install command:
  "commis install <slug>"
```

### CLI Installation Flow
```bash
$ commis install animated-button

1. Authenticate user
2. Query Convex for component by slug
3. Parse files array
4. Create directory structure
5. Write files to disk
6. Check dependencies
7. Update package.json (if needed)
8. Prompt to run package manager
9. Success message
```

## Query Examples (Convex)

### Get all public components
```typescript
export const listPublic = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("codeComponents")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();
  },
});
```

### Get component by slug
```typescript
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("codeComponents")
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first();
  },
});
```

### Search components by tag
```typescript
export const searchByTag = query({
  args: { tag: v.string() },
  handler: async (ctx, args) => {
    const components = await ctx.db
      .query("codeComponents")
      .filter((q) => q.eq(q.field("isPublic"), true))
      .collect();
    
    return components.filter((c) => c.tags.includes(args.tag));
  },
});
```

### User's private components
```typescript
export const myComponents = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();
    
    if (!user) throw new Error("User not found");
    
    return await ctx.db
      .query("codeComponents")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();
  },
});
```

## Mutation Examples (Convex)

### Create component
```typescript
export const create = mutation({
  args: {
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
        v.literal("json"),
        v.literal("markdown")
      ),
    })),
    dependencies: v.optional(v.record(v.string(), v.string())),
    framework: v.optional(v.union(
      v.literal("react"),
      v.literal("vue"),
      v.literal("vanilla"),
      v.literal("nextjs"),
      v.literal("svelte")
    )),
    tags: v.array(v.string()),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await getUserByToken(ctx, identity.tokenIdentifier);
    
    return await ctx.db.insert("codeComponents", {
      ...args,
      userId: user._id,
      version: "1.0.0",
      downloads: 0,
      stars: 0,
      isTemplate: false,
      updatedAt: Date.now(),
    });
  },
});
```

## CLI Installation Implementation

### Pseudocode
```typescript
async function installComponent(slug: string) {
  // 1. Authenticate
  const token = await getAuthToken();
  
  // 2. Fetch component
  const component = await convex.query(
    api.codeComponents.getBySlug,
    { slug }
  );
  
  if (!component) {
    throw new Error(`Component "${slug}" not found`);
  }
  
  // 3. Determine install path
  const installPath = component.installPath || "src/components";
  const basePath = path.join(process.cwd(), installPath);
  
  // 4. Check for conflicts
  const conflicts = await checkFileConflicts(component.files, basePath);
  if (conflicts.length > 0) {
    const shouldOverwrite = await promptOverwrite(conflicts);
    if (!shouldOverwrite) return;
  }
  
  // 5. Create directories and write files
  for (const file of component.files) {
    const filePath = path.join(basePath, file.path);
    const dir = path.dirname(filePath);
    
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, file.content, "utf8");
    
    console.log(`✓ Created ${file.path}`);
  }
  
  // 6. Handle dependencies
  if (component.dependencies) {
    const packageJson = await readPackageJson();
    const newDeps = Object.keys(component.dependencies).filter(
      (dep) => !packageJson.dependencies[dep]
    );
    
    if (newDeps.length > 0) {
      console.log("\nNew dependencies detected:");
      newDeps.forEach((dep) => {
        console.log(`  - ${dep}@${component.dependencies[dep]}`);
      });
      
      const shouldInstall = await prompt("Run package manager? (y/n)");
      if (shouldInstall) {
        await exec("npm install"); // or bun install
      }
    }
  }
  
  // 7. Track download
  await convex.mutation(
    api.codeComponents.incrementDownloads,
    { id: component._id }
  );
  
  console.log(`\n✓ Successfully installed ${component.name}!`);
}
```

## Next Steps

1. **Create Convex Schema**: Define the `codeComponents` table
2. **Create Queries/Mutations**: CRUD operations for components
3. **Web Integration**: Connect CodeEditor to real Convex data
4. **CLI Command**: Implement `commis install <slug>`
5. **Create Component Flow**: Allow users to publish components
6. **Search & Browse**: Build component library UI
7. **Preview/Sandbox**: Add Sandpack for live component preview

