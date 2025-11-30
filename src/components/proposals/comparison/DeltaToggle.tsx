"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight } from "lucide-react";

interface DeltaToggleProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export function DeltaToggle({ checked, onCheckedChange }: DeltaToggleProps) {
    return (
        <div className="flex items-center space-x-2 bg-slate-900/50 p-2 rounded-lg border border-white/10">
            <Switch id="delta-mode" checked={checked} onCheckedChange={onCheckedChange} />
            <Label htmlFor="delta-mode" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                Delta View
            </Label>
        </div>
    );
}
