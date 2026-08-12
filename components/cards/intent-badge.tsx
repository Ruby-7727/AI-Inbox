import { Bookmark, CalendarDays, MapPin, ShoppingBag, SquareCheckBig } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Intent } from "@/types";

const intentStyles = {
  Attend: { icon: CalendarDays, className: "bg-blue-50 text-blue-600" },
  Shop: { icon: ShoppingBag, className: "bg-green-50 text-green-700" },
  Go: { icon: MapPin, className: "bg-violet-50 text-violet-600" },
  Do: { icon: SquareCheckBig, className: "bg-amber-50 text-amber-600" },
  Remember: { icon: Bookmark, className: "bg-blue-50 text-blue-600" },
} satisfies Record<Intent, { icon: typeof CalendarDays; className: string }>;

export function IntentBadge({ intent, compact = false }: { intent: Intent; compact?: boolean }) {
  const { icon: Icon, className } = intentStyles[intent];

  return (
    <div className={cn("grid shrink-0 place-items-center rounded-xl", compact ? "size-16" : "h-24 w-24", className)}>
      <div className="text-center">
        <Icon className={cn("mx-auto", compact ? "size-6" : "size-8")} strokeWidth={1.8} aria-hidden="true" />
        <span className={cn("mt-2 block font-medium", compact ? "text-xs" : "text-sm")}>{intent}</span>
      </div>
    </div>
  );
}
