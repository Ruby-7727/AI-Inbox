import { Bookmark, CalendarDays, CircleHelp, MapPin, ShoppingBag, SquareCheckBig } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AnalysisIntent } from "@/types/analysis";
import type { Intent } from "@/types";

const intentStyles = {
  Attend: { icon: CalendarDays, className: "border-[#ccdae7] bg-[#e4edf5] text-[#527aa2]" },
  Shop: { icon: ShoppingBag, className: "border-[#d2ddc8] bg-[#e7eddf] text-[#607d49]" },
  Go: { icon: MapPin, className: "border-[#ddd0e9] bg-[#eee6f4] text-[#8261a4]" },
  Do: { icon: SquareCheckBig, className: "border-[#ead3a8] bg-[#f7e8c8] text-[#b87927]" },
  Remember: { icon: Bookmark, className: "border-[#ebcfc2] bg-[#f6e3da] text-[#b9644a]" },
  Other: { icon: CircleHelp, className: "border-[#dfd2c8] bg-[#eee7e0] text-[#7b6d64]" },
} satisfies Record<Intent, { icon: typeof CalendarDays; className: string }>;

export function IntentBadge({ intent, compact = false }: { intent: Intent; compact?: boolean }) {
  const { icon: Icon, className } = intentStyles[intent];

  return (
    <div className={cn("grid shrink-0 place-items-center rounded-2xl border shadow-[0_5px_14px_rgb(104_68_45_/_0.06)]", compact ? "size-16" : "h-24 w-24", className)}>
      <div className="text-center">
        <Icon className={cn("mx-auto", compact ? "size-6" : "size-8")} strokeWidth={1.8} aria-hidden="true" />
        <span className={cn("mt-2 block font-medium", compact ? "text-xs" : "text-sm")}>{intent}</span>
      </div>
    </div>
  );
}

export function intentLabel(intent: AnalysisIntent): Intent {
  if (intent === "attend") return "Attend";
  if (intent === "shop") return "Shop";
  if (intent === "go") return "Go";
  if (intent === "do") return "Do";
  if (intent === "remember") return "Remember";
  return "Other";
}
