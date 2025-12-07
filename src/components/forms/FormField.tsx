"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FieldStatusIcon } from "@/components/proposals/wizard/ValidationFeedback";
import { useFieldValidation } from "@/lib/hooks/useDebouncedValidation";

interface BaseFieldProps {
  name: string;
  label?: string;
  description?: string;
  className?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  suffix?: string;
  prefix?: string;
  disabled?: boolean;
  showValidation?: boolean;
  required?: boolean;
}

export function InputField({
  name,
  label,
  description,
  type = "text",
  placeholder,
  suffix,
  prefix,
  className,
  disabled,
  showValidation = true,
  required = false,
}: InputFieldProps) {
  const form = useFormContext();

  const value = form.watch(name);
  const { isValidating } = useFieldValidation(value);

  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => {
        const hasError = !!fieldState.error;
        const isValid = !hasError && fieldState.isDirty && !isValidating;

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                {label}
                {required && (
                  <span className="text-destructive ml-1" aria-label="required">
                    *
                  </span>
                )}
              </FormLabel>
            )}
            <FormControl>
              <div className="relative">
                {prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {prefix}
                  </span>
                )}
                <Input
                  type={type}
                  placeholder={placeholder}
                  disabled={disabled}
                  aria-invalid={hasError}
                  aria-describedby={
                    description ? `${name}-description` : undefined
                  }
                  aria-required={required}
                  className={cn(
                    prefix && "pl-8",
                    (suffix || showValidation) && "pr-12",
                    type === "number" && "tabular-nums",
                    hasError &&
                      "border-financial-negative focus-visible:ring-financial-negative",
                    isValid &&
                      "border-financial-positive focus-visible:ring-financial-positive",
                  )}
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    if (type === "number") {
                      const value =
                        e.target.value === "" ? "" : Number(e.target.value);
                      field.onChange(value);
                    } else {
                      field.onChange(e);
                    }
                  }}
                />
                {showValidation && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <FieldStatusIcon
                      error={fieldState.error?.message}
                      isValid={isValid}
                      isValidating={isValidating}
                    />
                  </div>
                )}
                {suffix && !showValidation && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    {suffix}
                  </span>
                )}
              </div>
            </FormControl>
            {description && (
              <FormDescription id={`${name}-description`}>
                {description}
              </FormDescription>
            )}
            <FormMessage className="text-financial-negative" />
          </FormItem>
        );
      }}
    />
  );
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string;
  rows?: number;
}

export function TextareaField({
  name,
  label,
  description,
  placeholder,
  rows = 3,
  className,
}: TextareaFieldProps) {
  const form = useFormContext();

  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              placeholder={placeholder}
              rows={rows}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface SelectFieldProps extends BaseFieldProps {
  placeholder?: string;
  options: { label: string; value: string }[];
}

export function SelectField({
  name,
  label,
  description,
  placeholder,
  options,
  className,
}: SelectFieldProps) {
  const form = useFormContext();

  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
