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
}: InputFieldProps) {
  const form = useFormContext();

  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
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
                className={cn(
                  prefix && "pl-8",
                  suffix && "pr-12",
                  type === "number" && "tabular-nums",
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
              {suffix && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {suffix}
                </span>
              )}
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
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
