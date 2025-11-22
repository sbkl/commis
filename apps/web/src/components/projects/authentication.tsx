"use client";

import { Button } from "@commis/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@commis/ui/components/field";
import { useAppForm } from "@commis/ui/components/form";
import z from "zod";
import { useProject } from "./provider";
import { useMutation } from "@/hooks/use-mutation";
import { api } from "@commis/api/src/convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  provider: z.enum(["convex", "clerk", "workos"]),
  // authenticationMethod: z.array(z.enum(["email", "otp", "google", "github"])),
  githubAuthProvider: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
  }),
});

export function ProjectAuthentication() {
  const router = useRouter();
  const { project } = useProject();
  const createAuth = useMutation(api.authentications.mutation.create, {
    onSuccess() {
      toast.success("Authentication created successfully");
      router.push(`/p/${project.slug}`);
    },
  });
  const form = useAppForm({
    defaultValues: {
      provider: "convex",
      // authenticationMethod: [] as ("email" | "otp" | "google" | "github")[],
      githubAuthProvider: {
        clientId: "",
        clientSecret: "",
      },
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: (values) => {
      createAuth.mutate({
        projectId: project._id,
        clientId: values.value.githubAuthProvider.clientId,
        clientSecret: values.value.githubAuthProvider.clientSecret,
      });
    },
  });
  return (
    <div className="w-full max-w-md mx-auto py-12">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(e);
        }}
      >
        <FieldGroup>
          <FieldSet>
            <FieldLegend className="text-2xl font-medium">
              Authentication
            </FieldLegend>
            <FieldDescription>
              Choose the authentication method you want to use for your Convex
              project.
            </FieldDescription>
            <FieldGroup>
              <form.AppField
                name="provider"
                children={(field) => (
                  <field.SelectField
                    label="Provider"
                    options={["convex", "clerk", "workos"]}
                  />
                )}
              />
              <form.AppField
                name="githubAuthProvider"
                children={(field) => (
                  <field.GithubAuthProviderField
                    applicationName={project.name}
                    homepageUrl={"http://localhost:3000"}
                    authorisationCallbackUrl={`https://${project.convexDeploymentName}.convex.site/api/auth/callback/github`}
                  />
                )}
              />
              <Field orientation="horizontal">
                <form.Subscribe
                  selector={(state) => state.values}
                  children={(values) => (
                    <Button
                      type="submit"
                      loading={createAuth.isPending}
                      disabled={
                        createAuth.isPending ||
                        !values.provider ||
                        !values.githubAuthProvider.clientId ||
                        !values.githubAuthProvider.clientSecret
                      }
                    >
                      Submit
                    </Button>
                  )}
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
