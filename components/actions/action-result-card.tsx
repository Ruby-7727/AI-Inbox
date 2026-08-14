import { CircleCheckBig, CircleX, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ActionResultCardProps = {
  status: "completed" | "failed";
  actionTitle: string;
  resultTitle?: string | null;
  message: string;
  completedAt?: Date | null;
  onRetry?: () => void;
};

export function ActionResultCard({ status, actionTitle, resultTitle, message, completedAt, onRetry }: ActionResultCardProps) {
  const completed = status === "completed";
  const Icon = completed ? CircleCheckBig : CircleX;

  return (
    <section
      aria-live="polite"
      className={cn(
        "min-w-72 rounded-xl border p-4",
        completed ? "border-green-200 bg-green-50/70" : "border-red-200 bg-red-50/70",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-white", completed ? "text-green-600" : "text-red-600")}>
          <Icon className="size-5" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("font-semibold", completed ? "text-green-800" : "text-red-800")}>{resultTitle ?? message}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{actionTitle}</p>
          {resultTitle ? <p className="mt-1 text-sm text-slate-600">{message}</p> : null}
          {completed && completedAt ? (
            <time className="mt-2 block text-xs text-green-700" dateTime={completedAt.toISOString()} title={completedAt.toLocaleString()}>
              Completed just now
            </time>
          ) : null}
        </div>
      </div>
      {!completed && onRetry ? (
        <Button className="mt-4 w-full border-red-200 bg-white text-red-700 hover:bg-red-100" onClick={onRetry} type="button" variant="outline">
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      ) : null}
    </section>
  );
}
