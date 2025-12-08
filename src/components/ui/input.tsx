import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles: clean, elegant
        "h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm",
        // Typography
        "placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground",
        // File input styling
        "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        // Dark mode
        "dark:bg-card dark:border-border",
        // Focus state: elegant ring
        "outline-none transition-[border-color,box-shadow] duration-200 ease-out",
        "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30",
        // Hover state: subtle border change
        "hover:border-border/80",
        // Disabled state
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
        // Invalid state
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
