"use client";

import * as React from "react";
import { useAppForm } from "@commis/ui/components/form";
import {
  frameworkSchema,
  packageManagerSchema,
} from "@commis/schemas/projects";
import z from "zod/v3";
import { Button } from "@commis/ui/components/button";
import { Field, FieldGroup } from "@commis/ui/components/field";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@commis/ui/components/sheet";
import { Plus } from "lucide-react";
import { useMutation } from "@/hooks/use-mutation";
import { api } from "@commis/api/src/convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NewProjectSheet() {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" tooltip="New Project">
          <Plus className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="pt-6">
        <SheetHeader className="px-6">
          <SheetTitle>New Project</SheetTitle>
          <SheetDescription>
            Select your framework and package manager of choice to get started
          </SheetDescription>
        </SheetHeader>
        <div className="px-6">
          <NewProjectForm setOpen={setOpen} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

const formSchema = z.object({
  name: z.string().min(1),
  framework: z
    .string()
    .min(1, "Framework is required")
    .refine((value) => frameworkSchema.safeParse(value).success, {
      message: "Invalid framework",
    }),
  packageManager: z
    .string()
    .min(1, "Package manager is required")
    .refine((value) => packageManagerSchema.safeParse(value).success, {
      message: "Invalid package manager",
    }),
});

const availableFrameworks = [
  {
    value: "expo",
    label: "Expo",
  },
  {
    value: "nextjs",
    label: "Next.js",
  },
  {
    value: "react-vite",
    label: "React (Vite)",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "tanstack-start",
    label: "Tanstack Start",
  },
];

const availablePackageManagers = [
  {
    value: "bun",
    label: "bun",
  },
  {
    value: "npm",
    label: "npm",
  },
  {
    value: "pnpm",
    label: "pnpm",
  },
  {
    value: "yarn",
    label: "yarn",
  },
];

export function NewProjectForm({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const createProject = useMutation(api.projects.mutation.create, {
    onSuccess: (projectSlug) => {
      router.push(`/p/${projectSlug}`);
      setOpen(false);
      toast.success("Project created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useAppForm({
    defaultValues: {
      name: "",
      framework: "expo",
      packageManager: "bun",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: (values) => {
      createProject.mutate({
        name: values.value.name,
        framework: frameworkSchema.parse(values.value.framework),
        packageManager: packageManagerSchema.parse(values.value.packageManager),
      });
    },
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(e);
      }}
    >
      <FieldGroup>
        <FieldGroup>
          <form.AppField
            name="name"
            children={(field) => (
              <field.TextField
                label="Project Name"
                disabled={createProject.isPending}
              />
            )}
          />
          <form.AppField
            name="framework"
            children={(field) => (
              <field.RadioGroupField
                label="Framework"
                options={availableFrameworks}
                disabled={createProject.isPending}
              />
            )}
          />
          <form.AppField
            name="packageManager"
            children={(field) => (
              <field.RadioGroupField
                label="Package Manager"
                options={availablePackageManagers}
                disabled={createProject.isPending}
              />
            )}
          />
        </FieldGroup>
        <Field orientation="horizontal">
          <form.Subscribe
            selector={(state) => state.values}
            children={(values) => (
              <Button
                type="submit"
                loading={createProject.isPending}
                disabled={
                  values.name === "" ||
                  !values.framework ||
                  createProject.isPending
                }
              >
                Create Project
              </Button>
            )}
          />
        </Field>
      </FieldGroup>
    </form>
  );
}
