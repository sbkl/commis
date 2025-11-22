import * as React from "react";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { cn } from "@commis/ui/lib/utils";
import { CheckCircle, Copy, ExternalLink, LucideIcon } from "lucide-react";
import { Input } from "@commis/ui/components/input";
import { Card, CardContent } from "@commis/ui/components/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@commis/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@commis/ui/components//input-group";
import { Textarea } from "@commis/ui/components/textarea";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@commis/ui/components/button-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@commis/ui/components/select";
import { ScrollArea } from "@commis/ui/components/scroll-area";
import { RadioGroup, RadioGroupItem } from "@commis/ui/components/radio-group";
import { Checkbox } from "./checkbox";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

interface TextFieldProps extends React.ComponentProps<typeof Input> {
  label?: string;
  loading?: boolean;
  fieldClassName?: string;
  description?: string;
  icon?: LucideIcon;
  addonRight?: React.ReactNode;
}

function TextField({
  label,
  loading = false,
  fieldClassName,
  description,
  icon: Icon,
  addonRight,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const hasErrors = field.state.meta.errors.length > 0;

  return (
    <Field
      data-invalid={hasErrors ? true : undefined}
      className={cn("w-full", fieldClassName)}
    >
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <InputGroup>
        <InputGroupInput
          {...props}
          name={field.name}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={hasErrors ? true : undefined}
        />
        {Icon ? (
          <InputGroupAddon>
            <Icon className="size-4 text-muted-foreground" />
          </InputGroupAddon>
        ) : null}
        {addonRight ? (
          <InputGroupAddon align="inline-end">{addonRight}</InputGroupAddon>
        ) : null}
      </InputGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

interface TextareaFieldProps extends React.ComponentProps<typeof Textarea> {
  label?: string;
  fieldClassName?: string;
  description?: string;
}

function TextareaField({
  label,
  fieldClassName,
  description,
  ...props
}: TextareaFieldProps) {
  const field = useFieldContext<string>();
  const hasErrors = field.state.meta.errors.length > 0;

  return (
    <Field data-invalid={hasErrors} className={cn("w-full", fieldClassName)}>
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <InputGroup>
        <InputGroupTextarea
          {...props}
          className={cn(props.className)}
          name={field.name}
          aria-invalid={hasErrors}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </InputGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

interface ButtonGroupTextFieldProps extends React.ComponentProps<typeof Input> {
  label?: string;
  loading?: boolean;
  fieldClassName?: string;
  description?: string;
  icon?: LucideIcon;
  addonRight?: React.ReactNode;
  prefix?: string;
  suffix?: string;
}

function ButtonGroupTextField({
  label,
  loading = false,
  fieldClassName,
  description,
  icon: Icon,
  addonRight,
  prefix,
  suffix,
  ...props
}: ButtonGroupTextFieldProps) {
  const field = useFieldContext<string>();
  const hasErrors = field.state.meta.errors.length > 0;

  return (
    <Field data-invalid={hasErrors} className={cn("w-full", fieldClassName)}>
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <ButtonGroup>
        {prefix ? <ButtonGroupText>{prefix}</ButtonGroupText> : null}
        <InputGroup>
          <InputGroupInput
            {...props}
            name={field.name}
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            aria-invalid={hasErrors}
          />
          {Icon ? (
            <InputGroupAddon>
              <Icon className="size-4 text-muted-foreground" />
            </InputGroupAddon>
          ) : null}
          {addonRight ? (
            <InputGroupAddon align="inline-end">{addonRight}</InputGroupAddon>
          ) : null}
        </InputGroup>
        {suffix ? <ButtonGroupText>{suffix}</ButtonGroupText> : null}
      </ButtonGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

type TSelectValue =
  | string
  | number
  | { value: string; label: string }
  | { value: number; label: string };

interface SelectFieldProps<T extends TSelectValue>
  extends Omit<React.ComponentProps<typeof Select>, "value" | "defaultValue"> {
  label?: string;
  options: TSelectValue[];
  placeholder?: string;
  value?: T;
  defaultValue?: T;
  description?: string;
}

function SelectField<T extends TSelectValue>({
  label,
  options,
  defaultValue,
  value,
  description,
  ...props
}: SelectFieldProps<T>) {
  const field = useFieldContext<T>();
  const hasErrors = field.state.meta.errors.length > 0;
  return (
    <Field data-invalid={hasErrors} className="w-full">
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <Select
        {...props}
        name={field.name}
        aria-invalid={hasErrors}
        defaultValue={
          typeof defaultValue === "object"
            ? defaultValue.value.toString()
            : defaultValue?.toString()
        }
        value={
          typeof field.state.value === "object"
            ? field.state.value.value.toString()
            : field.state.value.toString()
        }
        onValueChange={(value) => {
          const option1 = options[0];
          if (typeof option1 === "string") {
            field.handleChange(value as T);
          } else if (typeof option1 === "number") {
            field.handleChange(parseInt(value) as T);
          } else if (
            typeof option1 === "object" &&
            "value" in option1 &&
            "label" in option1
          ) {
            field.handleChange(
              options.find(
                (option) =>
                  typeof option === "object" &&
                  "value" in option &&
                  option.value.toString() === value
              ) as T
            );
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={props.placeholder ?? "Select an option"} />
        </SelectTrigger>
        <SelectContent className="z-99999 max-h-[300px]">
          <ScrollArea className="max-h-[100px]">
            {options.map((option) =>
              typeof option === "string" ? (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ) : typeof option === "number" ? (
                <SelectItem key={option} value={option.toString()}>
                  {option.toString()}
                </SelectItem>
              ) : typeof option === "object" &&
                "value" in option &&
                "label" in option ? (
                <SelectItem
                  key={option.value.toString()}
                  value={option.value.toString()}
                >
                  {option.label}
                </SelectItem>
              ) : null
            )}
          </ScrollArea>
        </SelectContent>
      </Select>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

interface RadioGroupFieldProps<
  T extends {
    label: string;
    description?: string;
    value: string;
    tag?: string;
  },
> extends React.ComponentProps<typeof RadioGroup> {
  label?: string;
  options: T[];
  activeValue?: string;
  activeValueLabel?: string;
}

function RadioGroupField<
  T extends {
    label: string;
    description?: string;
    value: string;
    tag?: string;
  },
>({
  label,
  options,
  activeValue,
  activeValueLabel,
  ...props
}: RadioGroupFieldProps<T>) {
  const field = useFieldContext<string>();
  const hasErrors = field.state.meta.errors.length > 0;

  const activeOption = options.find((option) => option.value === activeValue);

  return (
    <Field className="gap-6">
      {activeOption ? (
        <Field>
          {activeValueLabel ? (
            <FieldLabel
              className={cn(
                "text-sm font-medium",
                hasErrors ? "text-destructive" : ""
              )}
            >
              {activeValueLabel}
            </FieldLabel>
          ) : null}
          <Field
            orientation="horizontal"
            className="border border-border rounded-lg p-4"
          >
            <CheckCircle className="size-4 text-primary" />
            <FieldContent>
              <FieldTitle className="w-full">
                {activeOption.label}
                <span className="shrink-0 ml-auto">{activeOption.tag}</span>
              </FieldTitle>
              <FieldDescription>{activeOption.description}</FieldDescription>
            </FieldContent>
          </Field>
        </Field>
      ) : null}

      <Field>
        {label ? (
          <FieldLabel
            htmlFor={field.name}
            className={cn(
              "text-sm font-medium",
              hasErrors ? "text-destructive" : ""
            )}
          >
            {label}
          </FieldLabel>
        ) : null}

        <RadioGroup
          {...props}
          name={field.name}
          onValueChange={field.handleChange}
          value={field.state.value}
        >
          {options
            .filter((option) => option.value !== activeValue)
            .map((option) => (
              <FieldLabel
                key={option.value}
                htmlFor={option.value}
                className={cn({
                  "border-none *:data-[slot=field]:p-0 has-data-[state=checked]:bg-transparent":
                    !option.description,
                })}
              >
                <Field orientation="horizontal">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <FieldContent
                    className={cn({
                      "gap-0": !option.description,
                    })}
                  >
                    <FieldTitle className="w-full text-foreground/70">
                      {option.label}
                      <span className="shrink-0 ml-auto">{option.tag}</span>
                    </FieldTitle>
                    <FieldDescription>{option.description}</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            ))}
        </RadioGroup>
        <FieldError errors={field.state.meta.errors} />
      </Field>
    </Field>
  );
}

interface CheckboxFieldProps extends React.ComponentProps<typeof Checkbox> {
  label: string;
  description?: string;
}

function CheckboxField({ label, description, ...props }: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();
  const hasErrors = field.state.meta.errors.length > 0;

  return (
    <Field orientation="horizontal" data-invalid={hasErrors}>
      <Checkbox
        data-invalid={hasErrors}
        checked={field.state.value}
        onCheckedChange={(checked) => field.handleChange(Boolean(checked))}
        {...props}
      />
      <FieldContent>
        <FieldLabel htmlFor="finder-pref-9k2-sync-folders-nep">
          {label}
        </FieldLabel>
        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
      </FieldContent>
    </Field>
  );
}

interface CheckboxArrayFieldProps<
  T extends { label: string; description?: string; value: string },
> {
  options: T[];
  label?: string;
  description?: string;
  container?: (children: React.ReactNode) => React.ReactNode;
  tag?: React.ReactNode | ((option: T) => React.ReactNode);
}

function CheckboxArrayField<
  T extends { label: string; description?: string; value: string },
>({ label, description, options, container, tag }: CheckboxArrayFieldProps<T>) {
  const field = useFieldContext<T[]>();
  const hasErrors = field.state.meta.errors.length > 0;

  const content = (
    <>
      {options.map((option) => {
        const renderedTag = tag
          ? typeof tag === "function"
            ? tag(option)
            : tag
          : null;
        return (
          <Field
            key={option.value}
            orientation="horizontal"
            data-invalid={hasErrors}
          >
            <div className="shrink-0">
              {renderedTag ? (
                renderedTag
              ) : (
                <Checkbox
                  id={`form-tanstack-checkbox-${option.value}`}
                  name={field.name}
                  aria-invalid={hasErrors}
                  defaultChecked={field.state.value
                    .map((v) => v.value)
                    .includes(option.value)}
                  checked={field.state.value
                    .map((v) => v.value)
                    .includes(option.value)}
                  onCheckedChange={(checked) => {
                    console.log("checked", checked);
                    if (checked) {
                      field.pushValue(option);
                    } else {
                      const index = field.state.value
                        .map((v) => v.value)
                        .indexOf(option.value);
                      if (index > -1) {
                        field.removeValue(index);
                      }
                    }
                  }}
                />
              )}
            </div>

            <FieldContent>
              <div className="flex items-center gap-2 w-full">
                <FieldLabel
                  htmlFor={`form-tanstack-checkbox-${option.value}`}
                  className="font-normal"
                >
                  {option.label}
                </FieldLabel>
              </div>
              <FieldDescription>{option.description}</FieldDescription>
            </FieldContent>
          </Field>
        );
      })}
    </>
  );
  return (
    <FieldSet className="gap-0">
      {label ? <FieldLegend variant="label">{label}</FieldLegend> : null}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldGroup data-slot="checkbox-group">
        {typeof container === "function" ? (
          container(content)
        ) : (
          <div>{content}</div>
        )}
      </FieldGroup>
      {hasErrors && <FieldError errors={field.state.meta.errors} />}
    </FieldSet>
  );
}

interface GithubAuthProviderFieldProps {
  applicationName: string;
  homepageUrl: string;
  authorisationCallbackUrl: string;
}

function CopyableField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      <span className="text-xs text-muted-foreground/70 shrink-0 col-span-1 py-1">
        {label}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          "col-span-2 flex items-center text-xs font-mono px-2 py-1 rounded-md transition-colors w-full max-w-full overflow-hidden",
          "hover:bg-accent cursor-pointer",
          copied ? "bg-accent" : ""
        )}
      >
        <span className="truncate flex-1 text-left min-w-0 mr-2">{value}</span>
        {copied ? (
          <CheckCircle className="h-3.5 w-3.5 shrink-0 text-green-600" />
        ) : (
          <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

function GithubAuthProviderField({
  applicationName,
  homepageUrl,
  authorisationCallbackUrl,
}: GithubAuthProviderFieldProps) {
  const field = useFieldContext<{
    clientId: string;
    clientSecret: string;
  }>();

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend>GitHub OAuth Setup</FieldLegend>

        <div className="space-y-6">
          {/* Instructions Card */}
          <Card className="bg-muted/20 border-muted/40 py-3">
            <CardContent className="space-y-4 text-sm text-muted-foreground px-3">
              {/* Step 1 */}
              <div className="flex gap-2">
                <span className="shrink-0">1-</span>
                <div className="flex-1 min-w-0">
                  <a
                    href="https://github.com/settings/applications/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 hover:underline"
                  >
                    Open Github OAuth form
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="shrink-0">2-</span>
                  <div>Copy/Paste these values</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex-1 min-w-0">
                    <Card className="py-1.5">
                      <CardContent className="px-3">
                        <CopyableField
                          label="Application Name"
                          value={applicationName}
                        />
                        <CopyableField
                          label="Homepage URL"
                          value={homepageUrl}
                        />
                        <CopyableField
                          label="Callback"
                          value={authorisationCallbackUrl}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-2">
                <span className="shrink-0">3-</span>
                <div className="flex-1">Generate a Client Secret</div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-2">
                <span className="shrink-0">4-</span>
                <div className="flex-1">
                  Type in the Client ID and Secret below
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Input Section */}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${field.name}-client-id`}>
                Client ID
              </FieldLabel>
              <Input
                id={`${field.name}-client-id`}
                placeholder="Paste Client ID from GitHub"
                value={field.state.value.clientId}
                onChange={(e) =>
                  field.handleChange({
                    ...field.state.value,
                    clientId: e.target.value,
                  })
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${field.name}-client-secret`}>
                Client Secret
              </FieldLabel>
              <Input
                id={`${field.name}-client-secret`}
                type="password"
                placeholder="Paste Client Secret from GitHub"
                value={field.state.value.clientSecret}
                onChange={(e) =>
                  field.handleChange({
                    ...field.state.value,
                    clientSecret: e.target.value,
                  })
                }
              />
            </Field>
          </FieldGroup>
        </div>
      </FieldSet>
    </FieldGroup>
  );
}

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    TextareaField,
    ButtonGroupTextField,
    SelectField,
    RadioGroupField,
    CheckboxField,
    CheckboxArrayField,
    GithubAuthProviderField,
  },
  formComponents: {
    // SubscribeButton,
  },
  fieldContext,
  formContext,
});
