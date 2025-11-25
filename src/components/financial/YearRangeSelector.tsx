"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { YEAR_RANGES, YearRangeKey } from "@/lib/utils/financial";

interface YearRangeSelectorProps {
  selected: YearRangeKey;
  onChange: (range: YearRangeKey) => void;
  className?: string;
}

export function YearRangeSelector({
  selected,
  onChange,
  className,
}: YearRangeSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {(Object.keys(YEAR_RANGES) as YearRangeKey[]).map((key) => {
        const range = YEAR_RANGES[key];
        return (
          <Button
            key={key}
            variant={selected === key ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(key)}
            className="text-xs"
          >
            {range.label}
          </Button>
        );
      })}
    </div>
  );
}
