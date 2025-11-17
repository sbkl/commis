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
import z from "zod/v3";

const formSchema = z.object({
  provider: z.enum(["convex", "clerk", "workos"]),
  authenticationMethod: z.array(z.enum(["email", "otp", "google", "github"])),
});

export function ProjectAuthentication() {
  const form = useAppForm({
    defaultValues: {
      provider: "convex",
      authenticationMethod: [] as ("email" | "otp" | "google" | "github")[],
    },
    validators: {
      onSubmit: formSchema,
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
            <FieldLegend>Authentication</FieldLegend>
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
                name="authenticationMethod"
                children={(field) => (
                  <field.CheckboxArrayField
                    label="Authentication Method"
                    options={[
                      { label: "Email", value: "email" },
                      { label: "OTP", value: "otp" },
                      { label: "Google", value: "google" },
                      { label: "GitHub", value: "github" },
                    ]}
                  />
                )}
              />
              <Field orientation="horizontal">
                <Button type="submit">Submit</Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
