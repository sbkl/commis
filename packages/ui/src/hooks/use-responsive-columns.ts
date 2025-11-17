"use client";

import * as React from "react";

import { useMediaQuery } from "@commis/ui/hooks/use-media-query";

import { useWindowSize } from "@commis/ui/hooks/use-window-size";

interface UseResponsiveColumnsProps {
  columnWidth: number | undefined;
  gapX?: number;
  gap?: number;
  numColumns?: number;
  minColumns?: number;
  hasSecondarySidebar?: boolean;
  sidebarOpen: boolean | undefined;
  additionalOffset?: number;
}

export function useResponsiveColumns({
  columnWidth,
  gapX,
  gap,
  numColumns,
  minColumns = 1,
  hasSecondarySidebar,
  sidebarOpen,
  additionalOffset,
}: UseResponsiveColumnsProps) {
  const withVisibleSidebar = useMediaQuery("(min-width: 768px)");
  const { width: windowWidth } = useWindowSize();

  const availableWidth = React.useMemo(() => {
    // Only apply sidebar width calculations if there's actually a sidebar
    const hasPrimarySidebar = typeof sidebarOpen === "boolean";

    const sidebarWidth =
      (hasSecondarySidebar ? 180 : 0) +
      (hasPrimarySidebar && withVisibleSidebar ? (sidebarOpen ? 256 : 48) : 0);

    // Be more generous with available width for responsive calculations
    // The container will center itself with mx-auto, so we don't need to be as conservative
    const baseMargin = hasSecondarySidebar ? 64 : 32; // Keep some margin for comfort
    const result =
      windowWidth - sidebarWidth - baseMargin - (additionalOffset ?? 0);

    return result;
  }, [
    windowWidth,
    sidebarOpen,
    withVisibleSidebar,
    hasSecondarySidebar,
    additionalOffset,
  ]);

  const { columnCount, newContainerWidth, newColumnWidth } =
    React.useMemo(() => {
      if (!availableWidth || !columnWidth)
        return {
          columnCount: 1,
          newContainerWidth: availableWidth,
          newColumnWidth: availableWidth / (numColumns ?? 1),
        };

      const gapValue = gapX ?? gap ?? 0;
      // Calculate max columns that can fit with proper gap spacing
      // For N columns, we need: N * columnWidth + (N-1) * gap <= availableWidth
      // Rearranging: N <= (availableWidth + gap) / (columnWidth + gap)
      const maxColumns = Math.floor(
        (availableWidth + gapValue) / (columnWidth + gapValue)
      );
      const columnCount = Math.max(
        minColumns,
        Math.min(maxColumns, numColumns ?? maxColumns)
      );

      if (columnCount === 1) {
        return {
          columnCount,
          newContainerWidth: availableWidth,
          newColumnWidth: availableWidth,
        };
      }

      const newContainerWidth =
        columnWidth * columnCount + gapValue * (columnCount - 1);
      const newColumnWidth = columnWidth;
      return {
        columnCount,
        newContainerWidth,
        newColumnWidth,
      };
    }, [availableWidth, columnWidth, gapX, gap, numColumns, minColumns]);

  return {
    columnCount,
    availableWidth,
    newColumnWidth,
    newContainerWidth,
  };
}
