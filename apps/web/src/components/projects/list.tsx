"use client";

import { useInfiniteQuery } from "@/hooks/use-infinite-query";
import { api } from "@commis/api/src/convex/_generated/api";
import { FlatList } from "@commis/ui/components/list";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@commis/ui/components/card";
import Link from "next/link";
import { SearchInput, useQuerySearch } from "@/components/search";
import { NewProjectSheet } from "./new-project-form";
import { Button } from "@commis/ui/components/button";
import { Plus } from "lucide-react";

interface ProjectListProps {
  initialData: (typeof api.projects.query.list._returnType)["page"];
}

export function ProjectList({ initialData }: ProjectListProps) {
  const { optimisticSearchQuery } = useQuerySearch();

  const { data, fetchNextPage } = useInfiniteQuery(
    api.projects.query.list,
    {
      searchQuery: optimisticSearchQuery,
    },
    {
      initialNumItems: 24,
      initialData,
    }
  );
  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <Link href={`/p/${item.slug}`}>
          <Card>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardFooter>
              {item.framework} | {item.packageManager}
            </CardFooter>
          </Card>
        </Link>
      )}
      emptyState={<div>No projects found</div>}
      estimateSize={122}
      headerHeight={64}
      header={({ listWidth }) => <Header listWidth={listWidth} />}
      fetchNextPage={fetchNextPage}
      viewportClassName="h-[var(--project-content-height)]"
      columnWidth={300}
      numColumns={3}
      gap={16}
    />
  );
}

export function Header({ listWidth }: { listWidth: number }) {
  return (
    <div className="flex items-center h-full">
      <div
        className="mx-auto flex items-center justify-between h-full"
        style={{ width: listWidth }}
      >
        <h1>Projects</h1>
        <div className="flex items-center gap-2">
          <SearchInput />
          <NewProjectSheet>
            <Button icon={Plus}>New Project</Button>
          </NewProjectSheet>
        </div>
      </div>
    </div>
  );
}
