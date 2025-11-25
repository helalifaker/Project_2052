"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";

interface MillionsInputProps {
  /**
   * Field label
   */
  label: string;
  /**
   * Current value in SAR (not millions)
   */
  value: number;
  /**
   * Change handler - receives value in SAR
   */
  onChange: (value: number) => void;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Help text displayed below input
   */
  helpText?: string;
  /**
   * Error message
   */
  error?: string;
  /**
   * Whether field is required
   */
  required?: boolean;
  /**
   * Minimum value in SAR
   */
  min?: number;
  /**
   * Maximum value in SAR
   */
  max?: number;
  /**
   * Custom className
   */
  className?: string;
}

/**
 * MillionsInput Component
 *
 * Input field for financial amounts that:
 * - Displays values in Millions with "M" suffix
 * - Accepts input in millions (e.g., "125.75")
 * - Returns actual SAR value to parent (e.g., 125750000)
 * - Validates min/max ranges
 * - Shows formatted display on blur
 *
 * @example
 * <MillionsInput
 *   label="Base Rent 2028"
 *   value={3500000}
 *   onChange={(val) => setBaseRent(val)}
 *   helpText="Base rent for year 2028"
 *   required
 * />
 */
export function MillionsInput({
  label,
  value,
  onChange,
  placeholder = "0.00",
  helpText,
  error,
  required = false,
  min,
  max,
  className,
}: MillionsInputProps) {
  const formattedValue = useMemo(() => (value / 1_000_000).toFixed(2), [value]);
  const [displayValue, setDisplayValue] = useState<string>(formattedValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);

    // Parse and validate
    const numValue = parseFloat(input);
    if (!isNaN(numValue)) {
      const sarValue = numValue * 1_000_000;

      // Validate min/max
      if (min !== undefined && sarValue < min) {
        return; // Don't update if below min
      }
      if (max !== undefined && sarValue > max) {
        return; // Don't update if above max
      }

      onChange(sarValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Format to 2 decimals on blur
    const numValue = parseFloat(displayValue);
    if (!isNaN(numValue)) {
      setDisplayValue(numValue.toFixed(2));
    } else {
      setDisplayValue(formattedValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(formattedValue);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={label} className="text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-danger-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={label}
          type="number"
          value={isFocused ? displayValue : formattedValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          step="0.01"
          min={min ? min / 1_000_000 : undefined}
          max={max ? max / 1_000_000 : undefined}
          className={cn(
            "pr-10 font-mono tabular-nums",
            error && "border-danger-500 focus-visible:ring-danger-100",
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${label}-error` : helpText ? `${label}-help` : undefined
          }
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500 pointer-events-none">
          M
        </div>
      </div>
      {helpText && !error && (
        <p id={`${label}-help`} className="text-xs text-neutral-500">
          {helpText}
        </p>
      )}
      {error && (
        <p
          id={`${label}-error`}
          className="text-xs text-danger-500 flex items-center gap-1"
        >
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}
