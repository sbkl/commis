"use client";

import * as React from "react";
import { useMutation } from "@/hooks/use-mutation";
import { api } from "@commis/api/src/convex/_generated/api";
import { Button } from "@commis/ui/components/button";
import { Field, FieldContent, FieldGroup } from "@commis/ui/components/field";
import { useAppForm } from "@commis/ui/components/form";
import z from "zod/v3";
import { useProject } from "./projects/provider";
import { toast } from "sonner";
import { Spinner } from "@commis/ui/components/spinner";
import { zid } from "convex-helpers/server/zod";
import { ScrollArea } from "@commis/ui/components/scroll-area";

export const uiComponentsSchema = z.object({
  uiComponents: z.array(
    z.object({
      label: z.string(),
      value: zid("uiComponents"),
    })
  ),
});

export function UiComponents() {
  const { project, uiComponents } = useProject();

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
      onSubmit: uiComponentsSchema,
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
      className="max-w-4xl"
    >
      <FieldGroup className="">
        <FieldContent>
          <form.AppField
            name="uiComponents"
            mode="array"
            children={(field) => (
              <field.CheckboxArrayField
                label="UI Components"
                container={(children) => {
                  return (
                    <ScrollArea className="w-full h-[calc(var(--project-content-height)-var(--bottom-option-height)-82px)]">
                      <div className="px-4">{children}</div>
                    </ScrollArea>
                  );
                }}
                options={
                  uiComponents?.map((c) => {
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
