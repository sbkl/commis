"use client";

import * as React from "react";
import { useMutation } from "@/hooks/use-mutation";
import { api } from "@commis/api/src/convex/_generated/api";
import { Button } from "@commis/ui/components/button";
import { Field, FieldContent, FieldGroup } from "@commis/ui/components/field";
import { useAppForm } from "@commis/ui/components/form";
import z from "zod/v4";
import { useProject } from "./projects/provider";
import { toast } from "sonner";
import { Spinner } from "@commis/ui/components/spinner";
import { zid } from "convex-helpers/server/zod4";
import { ScrollArea } from "@commis/ui/components/scroll-area";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { SearchInput } from "./search";
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@commis/ui/components/dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@commis/ui/components/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";

export const uiComponentsSchema = z.object({
  uiComponents: z.array(
    z.object({
      label: z.string(),
      value: zid("uiComponents"),
    })
  ),
});

interface UiComponentsProps {
  preloadedUiComponentsQuery: Preloaded<typeof api.uiComponents.query.list>;
}

export function UiComponents({
  preloadedUiComponentsQuery,
}: UiComponentsProps) {
  const { project } = useProject();
  const uiComponentsQuery = usePreloadedQuery(preloadedUiComponentsQuery);

  const createMany = useMutation(api.uiComponents.mutation.upsert, {
    onSuccess: () => {
      toast.success("UI components updated successfully");
    },
  });
  const form = useAppForm({
    defaultValues: {
      uiComponents: project.uiComponents.map((component) => ({
        label: component.uiComponent.label,
        value: component.uiComponentId,
      })),
    },
    validators: {
      onSubmit: uiComponentsSchema as any,
    },
    onSubmit: (values) => {
      createMany.mutate({
        projectId: project._id,
        uiComponentIds: values.value.uiComponents.map((c) => c.value),
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
      className="max-w-4xl mx-auto py-12 px-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">UI Components</h3>
        <div className="flex items-center gap-2">
          <SearchInput />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Shadcn <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Shadcn</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <FieldGroup className="mt-8">
        <FieldContent>
          <form.AppField
            name="uiComponents"
            mode="array"
            children={(field) => (
              <field.CheckboxArrayField
                container={(children) => {
                  return (
                    <ScrollArea className="w-full h-[calc(var(--project-content-height)-var(--bottom-option-height))]">
                      <div className="px-4 grid grid-cols-4 gap-4">
                        {children}
                      </div>
                    </ScrollArea>
                  );
                }}
                options={
                  uiComponentsQuery?.map((c) => {
                    return {
                      label: c.label,
                      value: c._id,
                    };
                  }) ?? []
                }
                tag={(option) => {
                  const existing = project.uiComponents.find(
                    (component) => component.uiComponentId === option.value
                  );
                  if (!existing) return null;
                  if (
                    existing.status === "pending" ||
                    existing.status === "installing"
                  )
                    return <Spinner />;
                  if (existing.status === "installed") return <span>✅</span>;
                  if (existing.status === "failed") return <span>❌</span>;
                }}
              />
            )}
          />
        </FieldContent>
      </FieldGroup>
      <Field
        orientation="horizontal"
        className="w-full h-[var(--bottom-option-height)] px-6 border-t border-border/50"
      >
        <form.Subscribe
          selector={(state) => state.values.uiComponents}
          children={(selectedUiComponents) => (
            <Button
              type="submit"
              loading={createMany.isPending}
              disabled={
                // check selectedUiComponents vs. the -project ui components initially loaded
                selectedUiComponents.length === project.uiComponents.length
              }
            >
              Submit
            </Button>
          )}
        />
      </Field>
    </form>
  );
}
