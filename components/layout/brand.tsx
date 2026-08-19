import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="AI Inbox">
      <span className="grid size-10 place-items-center rounded-[0.8rem] bg-primary text-primary-foreground shadow-[0_8px_20px_rgb(145_72_51_/_0.22)]">
        <Inbox className="size-6" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className={cn("text-xl font-semibold tracking-[-0.03em] text-[#3d302b]", !compact && "text-2xl")}>AI Inbox</span>
    </div>
  );
}
