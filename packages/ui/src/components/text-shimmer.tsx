"use client";
import React, { useMemo } from "react";
import { cn } from "@commis/ui/lib/utils";

export type TextShimmerProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
};

function TextShimmerComponent({
  children,
  as: Component = "p",
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  return (
    <Component
      className={cn(
        "relative inline-block bg-size-[300%_100%,100%_100%] bg-clip-text",
        "text-transparent [--base-color:#a1a1aa] [--base-gradient-color:#ffffff]",
        "[background-repeat:no-repeat,no-repeat] [--bg:linear-gradient(90deg,#0000_calc(50%-var(--spread)),var(--base-gradient-color),#0000_calc(50%+var(--spread)))]",
        "bg-position-[100%_center,0%_center] [-webkit-text-fill-color:transparent]",
        "animate-[shimmer_var(--duration)_linear_infinite] fill-mode-[forwards]",
        "dark:[--base-color:#71717a] dark:[--base-gradient-color:#ffffff]",
        className
      )}
      style={
        {
          "--duration": `${duration}s`,
          "--spread": `${dynamicSpread}px`,
          backgroundImage: `var(--bg), linear-gradient(var(--base-color), var(--base-color))`,
        } as React.CSSProperties
      }
    >
      {children}
    </Component>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);
