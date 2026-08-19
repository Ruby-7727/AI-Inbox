import { CircleCheckBig, CircleX, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ResearchResult } from "@/components/actions/research-result";
import { cn } from "@/lib/utils";
import type { ActionType } from "@/lib/actions/types";
import type { ResearchResult as ResearchResultData } from "@/types/research";

type ActionResultCardProps = {
  status: "completed" | "failed";
  actionTitle: string;
  resultTitle?: string | null;
  message: string;
  completedAt?: Date | null;
  onRetry?: () => void;
  actionType?: ActionType;
  researchResult?: ResearchResultData | null;
};

export function ActionResultCard({ status, actionTitle, resultTitle, message, completedAt, onRetry, actionType, researchResult }: ActionResultCardProps) {
  const completed = status === "completed";
  const showResearch = completed && actionType === "research" && researchResult;
  const Icon = completed ? CircleCheckBig : CircleX;
  const heading = completed ? resultTitle ?? message : "Action failed";

  return (
    <section
      aria-live="polite"
      className={cn(
        "min-w-72 rounded-2xl border p-4 shadow-[0_5px_18px_rgb(104_68_45_/_0.05)]",
        showResearch && "w-full max-w-2xl",
        completed ? "border-[#cdd9c3] bg-[#edf2e8]" : "border-[#e3c2bd] bg-[#f8e8e4]",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-[#fffdf8]", completed ? "text-[#5f7d4b]" : "text-[#a94f48]")}>
          <Icon className="size-5" strokeWidth={2} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={cn("font-semibold", completed ? "text-green-800" : "text-red-800")}>{heading}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{actionTitle}</p>
          {(!completed || resultTitle) && !showResearch ? <p className="mt-1 text-sm text-slate-600">{message || "This action could not be completed."}</p> : null}
          {completed && completedAt ? (
            <time className="mt-2 block text-xs text-green-700" dateTime={completedAt.toISOString()} title={completedAt.toLocaleString()}>
              Completed just now
            </time>
          ) : null}
        </div>
      </div>
      {showResearch ? <ResearchResult result={researchResult} /> : null}
      {!completed && onRetry ? (
        <Button className="mt-4 w-full border-red-200 bg-white text-red-700 hover:bg-red-100" onClick={onRetry} type="button" variant="outline">
          <RotateCcw className="size-4" aria-hidden="true" />
          Retry
        </Button>
      ) : null}
    </section>
  );
}
