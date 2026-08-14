"use client";

import { CircleCheckBig, CircleX, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useActionHistory } from "@/components/actions/action-provider";
import { cn } from "@/lib/utils";

export function ActionHistory() {
  const { actions, clearHistory } = useActionHistory();
  if (!actions.length) return null;

  return (
    <section className="mt-7 border-t pt-6" aria-labelledby="recent-actions-title">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold" id="recent-actions-title">Recent Actions</h2>
        <Button className="h-9 text-muted-foreground" onClick={clearHistory} size="sm" type="button" variant="ghost">
          <Trash2 className="size-4" aria-hidden="true" />
          Clear
        </Button>
      </div>
      <div className="mt-3 divide-y overflow-hidden rounded-xl border bg-slate-50/50">
        {actions.map((action) => {
          const completed = action.status === "completed";
          const Icon = completed ? CircleCheckBig : CircleX;
          return (
            <article className="flex items-start gap-3 px-4 py-3" key={action.id}>
              <Icon className={cn("mt-0.5 size-5 shrink-0", completed ? "text-green-600" : "text-red-600")} aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-medium text-slate-800">{action.title}</p>
                <p className="mt-0.5 text-sm text-slate-600">{action.message}</p>
                <time className="mt-1 block text-xs text-muted-foreground" dateTime={action.timestamp.toISOString()} title={action.timestamp.toLocaleString()}>
                  {completed ? "Completed" : "Failed"} {formatRelativeTime(action.timestamp)}
                </time>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function formatRelativeTime(timestamp: Date) {
  const elapsedMinutes = Math.floor((Date.now() - timestamp.getTime()) / 60_000);
  if (elapsedMinutes < 1) return "just now";
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  return elapsedHours < 24 ? `${elapsedHours}h ago` : timestamp.toLocaleDateString();
}
