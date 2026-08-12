import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ActionButton({ label, icon: Icon, primary, className }: { label: string; icon: LucideIcon; primary?: boolean; className?: string }) {
  return (
    <Button className={cn("h-11 min-w-36", className)} variant={primary ? "default" : "outline"} type="button">
      <Icon className="size-4.5" strokeWidth={1.8} aria-hidden="true" />
      {label}
    </Button>
  );
}
