import { v } from "convex/values";
import { internalMutation } from "../../functions";
import { generateSlug } from "../../shared/utils";

const PLACEHOLDER_COMPONENT = {
  name: "Animated Button Component",
  version: "1.0.0",
  description: "A beautiful animated button with hover effects and variants",
  tags: ["ui", "button", "animation"],
  dependencies: {
    react: "^18.0.0",
    clsx: "^2.0.0",
    "framer-motion": "^11.0.0",
  },
  files: [
    {
      path: "components/ui/Button.tsx",
      language: "typescript",
      content: `import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  variant = "default",
  size = "md",
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "button",
        \`button-\${variant}\`,
        \`button-\${size}\`,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="button-loader">Loading...</span>
      ) : (
        children
      )}
    </motion.button>
  );
}`,
    },
    {
      path: "components/Button.css",
      language: "css",
      content: `.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  outline: none;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
.button-default {
  background: #3b82f6;
  color: white;
}

.button-default:hover {
  background: #2563eb;
}

.button-ghost {
  background: transparent;
  color: #374151;
}

.button-ghost:hover {
  background: #f3f4f6;
}

.button-outline {
  background: transparent;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.button-outline:hover {
  background: #f9fafb;
}

/* Sizes */
.button-sm {
  height: 2rem;
  padding: 0 0.75rem;
  font-size: 0.875rem;
}

.button-md {
  height: 2.5rem;
  padding: 0 1rem;
  font-size: 0.875rem;
}

.button-lg {
  height: 3rem;
  padding: 0 1.5rem;
  font-size: 1rem;
}

.button-loader {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}`,
    },
    {
      path: "lib/utils.ts",
      language: "typescript",
      content: `import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}`,
    },
    {
      path: "examples/basic-usage.tsx",
      language: "typescript",
      content: `import { Button } from "../components/Button";

export function Example() {
  return (
    <div className="space-x-4">
      <Button variant="default">
        Click me
      </Button>
      
      <Button variant="ghost">
        Ghost Button
      </Button>
      
      <Button variant="outline" size="lg">
        Large Outline
      </Button>
      
      <Button loading>
        Loading...
      </Button>
    </div>
  );
}`,
    },
    //     {
    //       path: "package.json",
    //       language: "json",
    //       content: `{
    //   "name": "animated-button",
    //   "version": "1.0.0",
    //   "dependencies": {
    //     "react": "^18.0.0",
    //     "clsx": "^2.0.0",
    //     "framer-motion": "^11.0.0"
    //   }
    // }`,
    //     },
  ],
};

export const seed = internalMutation({
  args: {
    userId: v.id("users"),
  },
  async handler(ctx, { userId }) {
    const { files, ...feature } = PLACEHOLDER_COMPONENT;

    const slug = await generateSlug(ctx, {
      value: feature.name,
      table: "codeFeatures",
    });
    const featureId = await ctx.db.insert("codeFeatures", {
      ...feature,
      userId,
      isPublic: true,
      slug,
    });

    for (const file of files) {
      await ctx.db.insert("codeFeatureFiles", {
        ...file,
        language: file.language as any,
        codeFeatureId: featureId,
      });
    }
  },
});
