import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "sidebar" | "header" | "overlay";
    intensity?: "low" | "medium" | "high";
}

const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
    ({ className, variant = "default", intensity = "medium", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    // Base glass styles
                    "relative overflow-hidden transition-all duration-300",
                    "border border-white/10 dark:border-white/5",

                    // Intensity (Blur)
                    intensity === "low" && "backdrop-blur-md",
                    intensity === "medium" && "backdrop-blur-xl",
                    intensity === "high" && "backdrop-blur-2xl",

                    // Variants
                    variant === "default" && [
                        "bg-white/40 dark:bg-black/40",
                        "shadow-lg shadow-black/5",
                        "rounded-2xl"
                    ],
                    variant === "sidebar" && [
                        "bg-white/60 dark:bg-[#0f1115]/80", // Slightly more opaque for readability
                        "border-r border-white/10"
                    ],
                    variant === "header" && [
                        "bg-white/70 dark:bg-[#0f1115]/70",
                        "border-b border-white/10",
                        "sticky top-0 z-50"
                    ],
                    variant === "overlay" && [
                        "bg-black/20 dark:bg-black/40",
                        "rounded-2xl"
                    ],

                    className
                )}
                {...props}
            >
                {/* Noise texture overlay for premium feel (optional, can be added via CSS variable later) */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-noise z-0" />

                {/* Content */}
                <div className="relative z-10">
                    {props.children}
                </div>
            </div>
        );
    }
);
GlassPanel.displayName = "GlassPanel";

export { GlassPanel };
