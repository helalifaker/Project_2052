import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinancialValue } from "./FinancialValue";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  type?: "currency" | "percent" | "number";
  trend?: {
    value: number;
    label: string;
  };
  icon?: LucideIcon;
  description?: string;
  colorMode?: "auto" | "negative"; // Minimalist: auto (red for negatives) or force negative
  className?: string;
}

export function MetricCard({
  title,
  value,
  type = "currency",
  trend,
  icon: Icon,
  description,
  colorMode = "auto",
  className,
}: MetricCardProps) {
  const trendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
        ? TrendingDown
        : Minus
    : null;

  const TrendIcon = trendIcon;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <FinancialValue
            value={value}
            type={type}
            colorMode={colorMode}
            size="xl"
          />
          {trend && TrendIcon && (
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendIcon
                className={cn(
                  "mr-1 h-3 w-3",
                  trend.value > 0 && "text-financial-positive",
                  trend.value < 0 && "text-financial-negative",
                )}
              />
              <FinancialValue
                value={Math.abs(trend.value)}
                type="percent"
                size="sm"
                className="mr-1"
                showColor={false}
              />
              <span>{trend.label}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
