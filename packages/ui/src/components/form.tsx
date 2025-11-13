import * as React from "react";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";

import { cn } from "@commis/ui/lib/utils";
import { CheckCircle, LucideIcon } from "lucide-react";
import { Input } from "@commis/ui/components/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
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

export function TextareaField({
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

export function RadioGroupField<
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

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    TextareaField,
    ButtonGroupTextField,
    SelectField,
    RadioGroupField,
  },
  formComponents: {
    // SubscribeButton,
  },
  fieldContext,
  formContext,
});
