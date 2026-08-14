"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Bell, CalendarDays, ChartNoAxesColumnIncreasing, Check, LoaderCircle, MapPin, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { executeAction } from "@/lib/actions/executor";
import { actionRegistry, createAction, type ActionIconIdentifier } from "@/lib/actions/registry";
import type { AIAction, ActionType } from "@/lib/actions/types";
import { cn } from "@/lib/utils";

const actionIcons: Record<ActionIconIdentifier, LucideIcon> = {
  "calendar-days": CalendarDays,
  bell: Bell,
  "map-pin": MapPin,
  search: Search,
  chart: ChartNoAxesColumnIncreasing,
};

export function ActionButton({ label, icon: FallbackIcon, primary, className, actionType, location }: { label: string; icon: LucideIcon; primary?: boolean; className?: string; actionType?: ActionType; location?: string | null }) {
  const [action, setAction] = useState<AIAction | null>(() => actionType ? { ...createAction(actionType), title: label, location } : null);
  const [executing, setExecuting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const definition = action ? actionRegistry[action.type] : null;
  const Icon = action?.status === "completed" ? Check : definition ? actionIcons[definition.icon] : FallbackIcon;

  async function handleClick() {
    if (!action || executing || action.status === "completed") return;
    setExecuting(true);
    const result = await executeAction(action);
    setAction(result.action);
    setMessage(result.message);
    setExecuting(false);
  }

  return (
    <Button
      className={cn("h-11 min-w-36", action?.status === "completed" && "border-green-200 bg-green-50 text-green-700 hover:bg-green-50", className)}
      disabled={executing || action?.status === "completed"}
      onClick={action ? handleClick : undefined}
      title={action?.description}
      variant={primary && action?.status !== "completed" ? "default" : "outline"}
      type="button"
    >
      {executing ? <LoaderCircle className="size-4.5 animate-spin" aria-hidden="true" /> : <Icon className="size-4.5" strokeWidth={1.8} aria-hidden="true" />}
      {executing ? "Working..." : message ?? action?.title ?? label}
    </Button>
  );
}
