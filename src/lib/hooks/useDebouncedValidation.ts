import { useEffect, useState, useMemo, useRef } from "react";

/**
 * Custom hook for debounced validation
 * Delays validation until user stops typing (300ms per CLAUDE.md)
 *
 * @param value - The value to validate
 * @param delay - Debounce delay in milliseconds (default: 300ms)
 * @returns Debounced value for validation
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to track validation state with debouncing
 * Provides loading state during debounce period
 */
export function useFieldValidation(fieldValue: unknown, delay = 300) {
  const debouncedValue = useDebouncedValue(fieldValue, delay);
  const previousValueRef = useRef(fieldValue);

  // Compute isValidating synchronously based on current vs debounced values
  const isValidating = useMemo(() => {
    return fieldValue !== debouncedValue;
  }, [fieldValue, debouncedValue]);

  // Update ref after render
  useEffect(() => {
    previousValueRef.current = fieldValue;
  });

  return {
    debouncedValue,
    isValidating,
  };
}
